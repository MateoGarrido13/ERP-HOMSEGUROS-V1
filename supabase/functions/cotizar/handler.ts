/**
 * Handler HTTP para POST /cotizar (prompt 03, ADR-005, ADR-006, ADR-007).
 *
 * Responsabilidades:
 * - Validar forma de `SolicitudCotizacion` (campos obligatorios, tipos estrictos, rechazo de propiedades adicionales).
 * - Límite de body (64 KB) para proteger contra DoS.
 * - Punto de extensión para validación JWT de Supabase Auth (ADR-006): no implementado en v1, el lugar está marcado con TODO.
 * - Delegar al Servicio de dominio (`ServicioCotizacion`).
 *
 * Contrato de errores (ADR-005):
 * - 405 -> { error: { code: "METODO_NO_PERMITIDO" } }
 * - 400 -> { error: { code: "BODY_INVALIDO" | "SOLICITUD_INVALIDA" } }
 * - 501 -> { error: { code: "NOT_IMPLEMENTED" } } (walking skeleton temporal)
 * - 200 -> CotizacionCanonica[]
 */

import type { AppError, SolicitudCotizacion } from "../_shared/types.ts";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB

const CAMPOS_REQUERIDOS = ["ramo", "conductor", "coberturaDeseada"] as const;
const RAMOS_VALIDOS = ["AU", "HO", "CO", "CC"];
const COBERTURAS_VALIDAS = [
  "terceros",
  "terceros_completo",
  "todo_riesgo",
];

function leerBodyJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function validarFormaSolicitud(body: unknown): SolicitudCotizacion {
  if (!esObjetoPlano(body)) {
    throw new AppError("SOLICITUD_INVALIDA", "El cuerpo debe ser un objeto JSON");
  }

  // Rechazar propiedades adicionales no definidas en el contrato.
  const propiedadesPermitidas = new Set([
    "ramo",
    "conductor",
    "coberturaDeseada",
    "vehiculo",
    "inmueble",
  ]);
  for (const clave of Object.keys(body)) {
    if (!propiedadesPermitidas.has(clave)) {
      throw new AppError(
        "SOLICITUD_INVALIDA",
        `Propiedad no permitida: ${clave}`
      );
    }
  }

  // Campos requeridos
  for (const campo of CAMPOS_REQUERIDOS) {
    if (!(campo in body) || body[campo] === undefined || body[campo] === null) {
      throw new AppError("SOLICITUD_INVALIDA", `Campo requerido faltante: ${campo}`);
    }
  }

  // `ramo` válido
  const ramo = body.ramo;
  if (typeof ramo !== "string" || !RAMOS_VALIDOS.includes(ramo)) {
    throw new AppError("SOLICITUD_INVALIDA", `ramo debe ser uno de: ${RAMOS_VALIDOS.join(", ")}`);
  }

  // `conductor` válido
  const conductor = body.conductor;
  if (!esObjetoPlano(conductor)) {
    throw new AppError("SOLICITUD_INVALIDA", "conductor debe ser un objeto");
  }
  if (
    typeof conductor.dni !== "string" ||
    conductor.dni.trim() === ""
  ) {
    throw new AppError("SOLICITUD_INVALIDA", "conductor.dni es requerido (string no vacío)");
  }
  if (
    typeof conductor.fechaNacimiento !== "string" ||
    conductor.fechaNacimiento.trim() === ""
  ) {
    throw new AppError("SOLICITUD_INVALIDA", "conductor.fechaNacimiento es requerido (string no vacío)");
  }

  // `coberturaDeseada` válido (case-sensitive, sin espacios)
  const cobertura = body.coberturaDeseada;
  if (
    typeof cobertura !== "string" ||
    !COBERTURAS_VALIDAS.includes(cobertura)
  ) {
    throw new AppError(
      "SOLICITUD_INVALIDA",
      `coberturaDeseada debe ser uno de: ${COBERTURAS_VALIDAS.join(", ")}`
    );
  }

  // `vehiculo` opcional, pero si viene debe tener todos sus campos
  if ("vehiculo" in body && body.vehiculo !== undefined && body.vehiculo !== null) {
    const vehiculo = body.vehiculo;
    if (!esObjetoPlano(vehiculo)) {
      throw new AppError("SOLICITUD_INVALIDA", "vehiculo debe ser un objeto");
    }
    for (const campo of ["marca", "modelo", "anio", "patente"]) {
      if (!(campo in vehiculo)) {
        throw new AppError("SOLICITUD_INVALIDA", `vehiculo.${campo} es requerido`);
      }
    }
    if (typeof vehiculo.anio !== "number" || !Number.isInteger(vehiculo.anio)) {
      throw new AppError("SOLICITUD_INVALIDA", "vehiculo.anio debe ser un número entero");
    }
  }

  // `inmueble` opcional, si viene debe tener direccion y tipoPropiedad
  if ("inmueble" in body && body.inmueble !== undefined && body.inmueble !== null) {
    const inmueble = body.inmueble;
    if (!esObjetoPlano(inmueble)) {
      throw new AppError("SOLICITUD_INVALIDA", "inmueble debe ser un objeto");
    }
    if (typeof inmueble.direccion !== "string" || inmueble.direccion.trim() === "") {
      throw new AppError("SOLICITUD_INVALIDA", "inmueble.direccion es requerido");
    }
    const tiposValidos = ["casa", "departamento", "consorcio", "comercio"];
    if (
      typeof inmueble.tipoPropiedad !== "string" ||
      !tiposValidos.includes(inmueble.tipoPropiedad)
    ) {
      throw new AppError("SOLICITUD_INVALIDA", `inmueble.tipoPropiedad debe ser uno de: ${tiposValidos.join(", ")}`);
    }
  }

  return body as SolicitudCotizacion;
}

/**
 * Punto de extensión para autenticación JWT (ADR-006).
 * No implementado en v1: el walking skeleton opera sin auth hasta que se añada.
 * El lugar está marcado intencionalmente para futura implementación.
 */
async function validarAuth(_req: Request): Promise<void> {
  // TODO ADR-006: validar JWT de Supabase Auth desde `Authorization: Bearer <token>`.
  // Si falta o es inválido, responder 401 Unauthorized.
  return;
}

export async function handleCotizar(req: Request): Promise<Response> {
  try {
    // TODO ADR-006: descomentar cuando se implemente auth en el handler.
    // await validarAuth(req);

    // Límite de body
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({ error: { code: "SOLICITUD_INVALIDA" } }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const body = await leerBodyJson(req);
    const solicitud = validarFormaSolicitud(body);

    // TODO: instanciar ServicioCotizacion y delegar (prompt 04/05).
    // Por ahora devolvemos 501 mientras el servicio y orquestador se completan.
    return new Response(
      JSON.stringify({ error: { code: "NOT_IMPLEMENTED" } }),
      { status: 501, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    if (err instanceof AppError) {
      return new Response(
        JSON.stringify({ error: { code: err.code } }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Error inesperado: no exponer detalles internos (ADR-010).
    return new Response(
      JSON.stringify({ error: { code: "ERROR_INTERNO" } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
