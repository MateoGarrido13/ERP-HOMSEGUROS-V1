/**
 * Capa Anticorrupción (ACL) para Mercantil Andina.
 *
 * Migra la lógica de cotización de autos de `front/src/lib/mercantil/` al
 * patrón ACL del hub de aseguradoras (Supabase Edge Functions / Deno).
 *
 * Arraigado en: ADR-002 (ACL por proveedor), ADR-004 (Edge Functions hub),
 * ADR-010 (sanitización PII), ADR-012 (marcador estimado).
 *
 * Flujo (según REQUEST-COTIZAR-AUTO.md y SUBSCRIPCIONES.md):
 *   1. POST /credenciales/v2/   → JWT (form-urlencoded, con Ocp-Apim-Subscription-Key)
 *   2. GET  /vehiculos/v1/      → infoauto del vehículo (q=marca modelo, anio, tipo=AUTO)
 *   3. POST /cotizaciones/v2/auto → cotización (JSON, Authorization: Bearer token)
 *
 * Variables de entorno requeridas:
 *   MERCANTIL_API_BASE        base de la API (default: https://apidev.mercantilandina.com.ar)
 *   MERCANTIL_API_KEY         Ocp-Apim-Subscription-Key (PK de api-cotiza-auto-v2)
 *   MERCANTIL_CLIENT_ID       client_id para /credenciales/v2/
 *   MERCANTIL_USERNAME        usuario entorno de prueba (ej. HOMSETST)
 *   MERCANTIL_PASSWORD        contraseña entorno de prueba (ej. home2026)
 *   MERCANTIL_GRANT_TYPE      grant_type (default: password)
 *   MERCANTIL_PRODUCTOR_ID    id del productor (ej. 83645)
 *   MERCANTIL_LOCALIDAD_ID    id de localidad por defecto (ej. 20512 = TANDIL)
 *   MERCANTIL_LOCALIDAD_CP    código postal por defecto (ej. 7000)
 *   MERCANTIL_USO             uso del vehículo (default: 1 = PARTICULAR)
 *   MERCANTIL_COMISION        comisión por defecto (default: 10)
 *   MERCANTIL_BONIFICACION    bonificación por defecto (default: 10)
 */

import type {
  CotizacionCanonica,
  IProveedorACL,
  SolicitudCotizacion,
} from "../../_shared/types.ts";
import { AppError, HttpClient } from "../../_shared/httpClient.ts";

// ---------------------------------------------------------------------------
// Configuración desde variables de entorno (nunca hardcodear credenciales)
// ---------------------------------------------------------------------------

function env(nombre: string, defecto?: string): string {
  const valor = Deno.env.get(nombre);
  if (valor !== undefined && valor !== "") return valor;
  if (defecto !== undefined) return defecto;
  throw new AppError(
    "CONFIGURACION_PROVEEDOR",
    `Falta variable de entorno ${nombre} para Mercantil Andina`
  );
}

const API_BASE = env("MERCANTIL_API_BASE", "https://apidev.mercantilandina.com.ar");
const API_KEY = env("MERCANTIL_API_KEY");
const CLIENT_ID = env("MERCANTIL_CLIENT_ID");
const USERNAME = env("MERCANTIL_USERNAME");
const PASSWORD = env("MERCANTIL_PASSWORD");
const GRANT_TYPE = env("MERCANTIL_GRANT_TYPE", "password");
const PRODUCTOR_ID = Number(env("MERCANTIL_PRODUCTOR_ID", "83645"));
const LOCALIDAD_ID = Number(env("MERCANTIL_LOCALIDAD_ID", "20512"));
const LOCALIDAD_CP = Number(env("MERCANTIL_LOCALIDAD_CP", "7000"));
const USO_VEHICULO = Number(env("MERCANTIL_USO", "1"));
const COMISION = Number(env("MERCANTIL_COMISION", "10"));
const BONIFICACION = Number(env("MERCANTIL_BONIFICACION", "10"));

// ---------------------------------------------------------------------------
// Caché de token de acceso (en memoria del isolate/working)
// ---------------------------------------------------------------------------

interface TokenCache {
  token: string | null;
  expiraEn: number; // timestamp (ms)
}

const cacheToken: TokenCache = { token: null, expiraEn: 0 };
const MARGEN_SEGURIDAD_SEGUNDOS = 60;

/**
 * Obtiene (y cachea) el JWT de acceso de Mercantil Andina.
 * Renueva automáticamente cuando expira o está próximo a expirar.
 */
async function obtenerToken(httpClient: HttpClient, signal: AbortSignal): Promise<string> {
  const ahora = Date.now();

  if (
    cacheToken.token &&
    ahora < cacheToken.expiraEn - MARGEN_SEGURIDAD_SEGUNDOS * 1000
  ) {
    return cacheToken.token;
  }

  // /credenciales/v2/ espera application/x-www-form-urlencoded, no JSON.
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    username: USERNAME,
    password: PASSWORD,
    grant_type: GRANT_TYPE,
  }).toString();

  const respuesta = await httpClient.post<{ access_token?: string; expires_in?: number }>(
    "/credenciales/v2/",
    body,
    signal,
    {
      "content-type": "application/x-www-form-urlencoded",
      "Ocp-Apim-Subscription-Key": API_KEY,
    }
  );

  const token = respuesta.access_token;
  const expiresIn = respuesta.expires_in ?? 3600;

  if (!token) {
    throw new AppError(
      "TOKEN_PROVEEDOR",
      "Mercantil Andina no devolvió access_token"
    );
  }

  cacheToken.token = token;
  cacheToken.expiraEn = ahora + expiresIn * 1000 - MARGEN_SEGURIDAD_SEGUNDOS * 1000;

  return token;
}

/**
 * Busca el infoauto de un vehículo por marca, modelo y año.
 * GET /vehiculos/v1/?q=marca modelo&anio=...&tipo=AUTO
 */
async function buscarInfoauto(
  httpClient: HttpClient,
  token: string,
  marca: string,
  modelo: string,
  anio: number,
  signal: AbortSignal
): Promise<number> {
  const q = `${marca} ${modelo}`;
  const url = `/vehiculos/v1/?q=${encodeURIComponent(q)}&anio=${anio}&tipo=AUTO`;

  const respuesta = await httpClient.get<Array<{ infoauto?: number; nombre?: string }>>(
    url,
    signal,
    {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": API_KEY,
    }
  );

  const vehiculo = respuesta[0];
  if (!vehiculo || vehiculo.infoauto === undefined) {
    throw new AppError(
      "VEHICULO_NO_ENCONTRADO",
      `No se encontró infoauto para ${marca} ${modelo} ${anio} en Mercantil Andina`
    );
  }

  return vehiculo.infoauto;
}

// ---------------------------------------------------------------------------
// Mapeo canónico → solicitud wire de Mercantil Andina
// ---------------------------------------------------------------------------

interface CotizarAutoRequestMercantil {
  localidad: {
    codigo_postal: number;
    id: number;
  };
  vehiculo: {
    infoauto: number;
    anio: number;
    uso: number;
    gnc: boolean;
    rastreo: number;
  };
  comision: number;
  bonificacion: number;
  periodo: number;
  cuotas: number;
  pago: { tipo_pago: "C" };
  ajuste_suma: number;
  iva: number;
  desglose: boolean;
  productor: { id: number };
}

function toProveedorRequest(
  solicitud: SolicitudCotizacion,
  infoauto: number
): CotizarAutoRequestMercantil {
  const vehiculo = solicitud.vehiculo;
  if (!vehiculo) {
    throw new AppError(
      "SOLICITUD_INVALIDA",
      "Mercantil Andina requiere datos de vehículo (ramo Automotor)"
    );
  }

  return {
    localidad: {
      codigo_postal: LOCALIDAD_CP,
      id: LOCALIDAD_ID,
    },
    vehiculo: {
      infoauto,
      anio: vehiculo.anio,
      uso: USO_VEHICULO,
      gnc: false,
      rastreo: 0,
    },
    comision: COMISION,
    bonificacion: BONIFICACION,
    periodo: 1,
    cuotas: 1,
    pago: { tipo_pago: "C" },
    ajuste_suma: 0,
    iva: 5,
    desglose: true,
    productor: { id: PRODUCTOR_ID },
  };
}

// ---------------------------------------------------------------------------
// Mapeo respuesta wire de Mercantil Andina → canónico
// ---------------------------------------------------------------------------

interface CotizacionRespuestaMercantil {
  id: string;
  mercantilId: number;
  vehiculoNombre: string;
  sumaAsegurada: number;
  planes: number;
}

function toCanonical(
  respuesta: CotizacionRespuestaMercantil,
  solicitud: SolicitudCotizacion
): CotizacionCanonica {
  return {
    proveedorId: "prov_mercantil_andina",
    prima: respuesta.sumaAsegurada,
    moneda: "ARS",
    cobertura: solicitud.coberturaDeseada,
    vigenciaDesde: new Date().toISOString(),
    vigenciaHasta: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString(), // vigencia 1 año por defecto
    urlDetalle: undefined,
    error: undefined,
    estimado: false, // cotización real de aseguradora (ADR-012)
  };
}

// ---------------------------------------------------------------------------
// ACL: ProvMercantilAndinaACL
// ---------------------------------------------------------------------------

export class ProvMercantilAndinaACL implements IProveedorACL {
  readonly proveedorId = "prov_mercantil_andina";

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Cotiza un auto en Mercantil Andina.
   * Flujo: obtener token → buscar infoauto → POST cotizaciones/v2/auto.
   * Cualquier falla devuelve CotizacionCanonica con `error` (degradación graceful).
   */
  async cotizar(
    solicitud: SolicitudCotizacion,
    signal: AbortSignal
  ): Promise<CotizacionCanonica> {
    try {
      // Solo soportamos ramo Automotor en este ACL.
      if (solicitud.ramo !== "AU") {
        return {
          proveedorId: this.proveedorId,
          prima: 0,
          moneda: "ARS",
          cobertura: solicitud.coberturaDeseada,
          vigenciaDesde: new Date().toISOString(),
          vigenciaHasta: new Date().toISOString(),
          error: "Mercantil Andina solo soporta cotizaciones de Automotor en v1",
          estimado: false,
        };
      }

      if (!solicitud.vehiculo) {
        return {
          proveedorId: this.proveedorId,
          prima: 0,
          moneda: "ARS",
          cobertura: solicitud.coberturaDeseada,
          vigenciaDesde: new Date().toISOString(),
          vigenciaHasta: new Date().toISOString(),
          error: "Datos de vehículo requeridos para cotizar en Mercantil Andina",
          estimado: false,
        };
      }

      const token = await obtenerToken(this.httpClient, signal);

      const infoauto = await buscarInfoauto(
        this.httpClient,
        token,
        solicitud.vehiculo.marca,
        solicitud.vehiculo.modelo,
        solicitud.vehiculo.anio,
        signal
      );

      const request = toProveedorRequest(solicitud, infoauto);

      const respuesta = await httpClient.post<CotizacionRespuestaMercantil>(
        "/cotizaciones/v2/auto",
        request,
        signal,
        {
          Authorization: `Bearer ${token}`,
          "Ocp-Apim-Subscription-Key": API_KEY,
        }
      );

      return toCanonical(respuesta, solicitud);
    } catch (err) {
      // Degradación graceful: nunca relanzar al orquestador (ADR-002, prompt 06).
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      return {
        proveedorId: this.proveedorId,
        prima: 0,
        moneda: "ARS",
        cobertura: solicitud.coberturaDeseada,
        vigenciaDesde: new Date().toISOString(),
        vigenciaHasta: new Date().toISOString(),
        error: mensaje.includes("TOKEN_PROVEEDOR") || mensaje.includes("CONFIGURACION_PROVEEDOR")
          ? "proveedor no disponible"
          : mensaje,
        estimado: false,
      };
    }
  }
}
