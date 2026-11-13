"use server";

import "server-only";

import { cache } from "react";

import type {
  MercantilCredencialesResponse,
  MercantilError,
} from "./types";

/**
 * Cliente HTTP de la API de Mercantil Andina (entorno de prueba: apidev.mercantilandina.com.ar).
 *
 * Diseño:
 * - Solo se usa en el servidor (server-only). Nunca se expone al navegador.
 * - Token de acceso en caché en memoria con expiración (expires_in) y margen de seguridad.
 * - Todas las credenciales vienen de variables de entorno; nunca se hardcodean.
 *
 * Variables de entorno requeridas:
 *   MERCANTIL_API_BASE       base de la API (default: https://apidev.mercantilandina.com.ar)
 *   MERCANTIL_API_KEY        Ocp-Apim-Subscription-Key (PK de api-cotiza-auto-v2)
 *   MERCANTIL_CLIENT_ID      client_id para /credenciales/v2/
 *   MERCANTIL_USERNAME       usuario del entorno de prueba (ej. HOMSETST)
 *   MERCANTIL_PASSWORD       contraseña del entorno de prueba (ej. home2026)
 *   MERCANTIL_GRANT_TYPE     grant_type (default: password)
 */

const MARGEN_SEGURIDAD_SEGUNDOS = 60;

interface TokenCache {
  token: string | null;
  expiraEn: number; // timestamp (ms) de expiración real
}

const cacheToken: TokenCache = { token: null, expiraEn: 0 };

function env(nombre: string, defecto?: string): string {
  const valor = process.env[nombre];
  if (valor !== undefined && valor !== "") return valor;
  if (defecto !== undefined) return defecto;
  throw new Error(`[mercantil] Falta variable de entorno ${nombre}`);
}

const API_BASE = env("MERCANTIL_API_BASE", "https://apidev.mercantilandina.com.ar");
const API_KEY = env("MERCANTIL_API_KEY");
const CLIENT_ID = env("MERCANTIL_CLIENT_ID");
const USERNAME = env("MERCANTIL_USERNAME");
const PASSWORD = env("MERCANTIL_PASSWORD");
const GRANT_TYPE = env("MERCANTIL_GRANT_TYPE", "password");

/**
 * Obtiene (y cachea) el JWT de acceso de Mercantil Andina.
 * Renueva automáticamente cuando expira o está próximo a expirar.
 */
export const getMercantilToken = cache(async (): Promise<string> => {
  const ahora = Date.now();

  // Si hay token válido con margen de seguridad, lo reusamos.
  if (cacheToken.token && ahora < cacheToken.expiraEn - MARGEN_SEGURIDAD_SEGUNDOS * 1000) {
    return cacheToken.token;
  }

  const respuesta = await fetch(`${API_BASE}/credenciales/v2/`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      username: USERNAME,
      password: PASSWORD,
      grant_type: GRANT_TYPE,
    }),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => "");
    throw new MercantilHttpError(
      respuesta.status,
      `Error obteniendo token de Mercantil Andina (${respuesta.status}): ${texto}`,
      texto
    );
  }

  const datos: MercantilCredencialesResponse = await respuesta.json();

  cacheToken.token = datos.access_token;
  // expires_in está en segundos; convertimos a ms y restamos el margen de seguridad.
  cacheToken.expiraEn = ahora + datos.expires_in * 1000 - MARGEN_SEGURIDAD_SEGUNDOS * 1000;

  return datos.access_token;
});

/**
 * Ejecuta una petición autenticada contra la API de Mercantil Andina.
 * Renueva el token automáticamente si recibe 401 TokenInvalido.
 */
export async function mercantilFetch<T>(
  path: string,
  opciones: Omit<RequestInit, "body"> & { body?: unknown }
): Promise<T> {
  const token = await getMercantilToken();

  const headers: Record<string, string> = {
    "Ocp-Apim-Subscription-Key": API_KEY,
    Authorization: `Bearer ${token}`,
    ...(opciones.headers as Record<string, string> | undefined),
  };

  let cuerpo: string | undefined;
  if (opciones.body !== undefined) {
    if (typeof opciones.body === "string") {
      cuerpo = opciones.body;
      headers["Content-Type"] = "application/json";
    } else {
      cuerpo = JSON.stringify(opciones.body);
      headers["Content-Type"] = "application/json";
    }
  }

  const respuesta = await fetch(`${API_BASE}${path}`, {
    ...opciones,
    headers,
    body: cuerpo,
    cache: "no-store",
  });

  // Si el token expiró justo ahora, lo invalidamos y reintentamos una vez.
  if (respuesta.status === 401) {
    cacheToken.token = null;
    cacheToken.expiraEn = 0;

    const tokenNuevo = await getMercantilToken();
    headers["Authorization"] = `Bearer ${tokenNuevo}`;

    const respuesta2 = await fetch(`${API_BASE}${path}`, {
      ...opciones,
      headers,
      body: cuerpo,
      cache: "no-store",
    });

    if (!respuesta2.ok) {
      const texto = await respuesta2.text().catch(() => "");
      throw new MercantilHttpError(
        respuesta2.status,
        `Error de Mercantil Andina (${respuesta2.status}): ${texto}`,
        texto
      );
    }

    return (await respuesta2.json()) as T;
  }

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => "");
    throw new MercantilHttpError(
      respuesta.status,
      `Error de Mercantil Andina (${respuesta.status}): ${texto}`,
      texto
    );
  }

  return (await respuesta.json()) as T;
}

export class MercantilHttpError extends Error implements MercantilError {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "MercantilHttpError";
    this.status = status;
    this.body = body;
  }
}
