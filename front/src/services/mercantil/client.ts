import "server-only"

import { informarAuditoria, informarConsulta } from "@/services/auditoria/log"
import { mercantilConfig } from "@/services/mercantil/config"
import type {
  MercantilCotizacionResponse,
  MercantilLocalidad,
  MercantilVehiculo,
} from "@/services/mercantil/types"
import { QuoteServiceError } from "@/services/mercantil/types"

interface TokenCache {
  value: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

interface MercantilErrorItem {
  id?: string
  codigo?: string
  texto?: string
  mensaje?: string
}

interface MercantilErrorBody {
  mensaje?: string
  message?: string
  errores?: MercantilErrorItem[]
}

async function readBody(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function firstError(body: unknown): MercantilErrorItem | undefined {
  if (!body || typeof body !== "object") return undefined
  return (body as MercantilErrorBody).errores?.[0]
}

export function mercantilErrorCode(error: unknown) {
  return error instanceof QuoteServiceError ? error.code : undefined
}

function mercantilMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback
  const data = body as MercantilErrorBody
  const item = firstError(body)
  const detail = item?.mensaje || item?.texto || data.mensaje || data.message
  const code = item?.id || item?.codigo
  if (detail && code) return `${code}: ${detail}`
  return detail || fallback
}

function auditRequestBody(path: string, body: BodyInit | null | undefined) {
  if (path.includes("credenciales")) {
    return { grant_type: "password", client_id: "api-clientes-login", password: "[redacted]" }
  }
  if (typeof body !== "string" || !body) return undefined
  try {
    return JSON.parse(body) as unknown
  } catch {
    return body
  }
}

function auditResponseBody(path: string, body: unknown) {
  if (!path.includes("credenciales") || !body || typeof body !== "object") return body
  const data = body as Record<string, unknown>
  return {
    ...data,
    access_token: data.access_token ? "[redacted]" : data.access_token,
    refresh_token: data.refresh_token ? "[redacted]" : data.refresh_token,
  }
}

function consultaMensaje(path: string, status: number, ok: boolean, body: unknown) {
  if (!ok) return mercantilMessage(body, `Mercantil respondió ${status}`)
  if (!body || typeof body !== "object") return `HTTP ${status}`
  const data = body as Record<string, unknown>
  if (path.includes("credenciales")) return "OK token recibido"
  if (Array.isArray((data as { datos?: unknown }).datos)) {
    return `OK ${(data as { datos: unknown[] }).datos.length} resultados`
  }
  const id = data.id
  const cantidad = data.cantidad
  if (id != null && cantidad != null) return `OK cotizacion ${id} (${cantidad} planes)`
  if (id != null) return `OK id ${id}`
  return `HTTP ${status}`
}

async function request<T>(path: string, init: RequestInit = {}, key?: string): Promise<T> {
  const config = mercantilConfig()
  const metodo = (init.method ?? "GET").toUpperCase()
  let response: Response
  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Ocp-Apim-Subscription-Key": key ?? config.subscriptionKey,
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Fallo de red con Mercantil Andina."
    const entry = {
      evento: "mercantil_red",
      metodo,
      path,
      mensaje,
      request: auditRequestBody(path, init.body),
    }
    await informarConsulta(entry)
    await informarAuditoria(entry)
    throw new QuoteServiceError("No se pudo conectar con Mercantil Andina.", 502)
  }

  const body = await readBody(response)
  const mensaje = consultaMensaje(path, response.status, response.ok, body)
  await informarConsulta({
    evento: "mercantil_http",
    status: response.status,
    metodo,
    path,
    mensaje,
    request: auditRequestBody(path, init.body),
    response: auditResponseBody(path, body),
  })
  if (!response.ok) {
    const item = firstError(body)
    await informarAuditoria({
      evento: "mercantil_http",
      status: response.status,
      metodo,
      path,
      mensaje,
      request: auditRequestBody(path, init.body),
      response: body,
    })
    throw new QuoteServiceError(
      mensaje,
      response.status >= 500 ? 502 : 400,
      item?.id || item?.codigo,
    )
  }
  return body as T
}

export async function getAccessToken() {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value
  }

  const config = mercantilConfig()
  const payload = new URLSearchParams({
    client_id: "api-clientes-login",
    username: config.username,
    password: config.password,
    grant_type: "password",
  })

  const data = await request<{ access_token: string; expires_in?: number }>(
    "/credenciales/v2/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    },
  )

  const token = data.access_token?.trim()
  if (!token) {
    throw new QuoteServiceError("Mercantil no devolvió un access_token.", 502)
  }

  const ttlMs = Math.max(60, (data.expires_in ?? 3600) - 60) * 1000
  tokenCache = { value: token, expiresAt: Date.now() + ttlMs }
  return token
}

async function authorized<T>(path: string, init: RequestInit = {}) {
  const token = await getAccessToken()
  return request<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
}

export async function searchLocalidades(query: string) {
  const data = await authorized<{ datos?: MercantilLocalidad[] }>(
    `/generales/v1/localidades?q=${encodeURIComponent(query)}`,
  )
  return data.datos ?? []
}

export async function searchVehiculos(query: string, anio: number) {
  const params = new URLSearchParams({
    q: query,
    anio: String(anio),
    tipo: "AUTO",
  })
  const data = await authorized<{ datos?: MercantilVehiculo[] }>(`/vehiculos/v1/?${params}`)
  return data.datos ?? []
}

export async function postCotizarAuto(body: unknown) {
  return authorized<MercantilCotizacionResponse>("/cotizaciones/v2/auto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
