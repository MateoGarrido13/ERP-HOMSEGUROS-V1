"use server";

import { mercantilFetch, MercantilHttpError } from "./client";

import type {
  MercantilCotizarAutoRequest,
  MercantilCotizarAutoResponse,
  MercantilLocalidad,
  MercantilVehiculo,
} from "./types";

/**
 * Server Actions para la API de Mercantil Andina.
 *
 * Todas son funciones de servidor (Next.js App Router). Pueden llamarse
 * desde Server Components o desde form actions del cliente.
 *
 * Datos de prueba validados en CONSULTAS.log (usuario HOMSETST, productor 83645):
 *   - Localidad TANDIL: id 20512, CP 7000
 *   - Vehículo Palio 1.4 FIRE ELX 2007: infoauto 170499
 *   - Vehículo Gol GL 1.6 MI 1998: infoauto 460145
 */

/**
 * Obtiene un token de acceso fresco de Mercantil Andina.
 * Útil para validar credenciales antes de cotizar.
 */
export async function mercantilObtenerToken(): Promise<{ ok: true; token: string }> {
  const { getMercantilToken } = await import("./client");
  const token = await getMercantilToken();
  return { ok: true, token };
}

/**
 * Busca localidades por nombre / código postal.
 * Ejemplo: buscarLocalidades("TANDIL") → [{ id: 20512, nombre: "TANDIL", codigo_postal: 7000 }]
 */
export async function mercantilBuscarLocalidades(q: string): Promise<{
  ok: true;
  localidades: MercantilLocalidad[];
}> {
  const localidades = await mercantilFetch<MercantilLocalidad[]>(
    `/generales/v1/localidades?q=${encodeURIComponent(q)}`,
    { method: "GET" }
  );
  return { ok: true, localidades };
}

/**
 * Busca vehículos por modelo y año.
 * Ejemplo: buscarVehiculos("PALIO 1.4 FIRE ELX", 2007, "AUTO")
 */
export async function mercantilBuscarVehiculos(
  q: string,
  anio: number,
  tipo: "AUTO" | "MOTO" = "AUTO"
): Promise<{ ok: true; vehiculos: MercantilVehiculo[] }> {
  const path = `/vehiculos/v1/?q=${encodeURIComponent(q)}&anio=${anio}&tipo=${tipo}`;
  const vehiculos = await mercantilFetch<MercantilVehiculo[]>(path, { method: "GET" });
  return { ok: true, vehiculos };
}

/**
 * Cotiza un auto en Mercantil Andina.
 * Devuelve la cotización con su id interno, mercantilId, suma asegurada y cantidad de planes.
 */
export async function mercantilCotizarAuto(
  request: MercantilCotizarAutoRequest
): Promise<{ ok: true; cotizacion: MercantilCotizarAutoResponse }> {
  const cotizacion = await mercantilFetch<MercantilCotizarAutoResponse>(
    "/cotizaciones/v2/auto",
    {
      method: "POST",
      body: request,
    }
  );
  return { ok: true, cotizacion };
}

export type {
  MercantilCotizarAutoRequest,
  MercantilCotizarAutoResponse,
  MercantilLocalidad,
  MercantilVehiculo,
  MercantilHttpError,
};
