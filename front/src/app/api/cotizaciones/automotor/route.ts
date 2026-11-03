import { NextResponse } from "next/server"

import { informarAuditoria, informarConsulta } from "@/services/auditoria/log"
import { listAutomotorLeads } from "@/services/leads/automotor-leads"
import { emitirCotizacionAutomotor } from "@/services/mercantil/cotizar-auto.service"
import { QuoteServiceError } from "@/services/mercantil/types"

export const runtime = "nodejs"

export async function GET() {
  try {
    const leads = await listAutomotorLeads()
    return NextResponse.json(leads)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron leer las cotizaciones."
    const status = message.includes("DATABASE_URL") || message.startsWith("Falta ") ? 503 : 500
    return NextResponse.json({ message }, { status })
  }
}

function quoteAuditContext(body: unknown) {
  if (!body || typeof body !== "object") return undefined
  const data = body as Record<string, unknown>
  return {
    patente: data.patente,
    cp: data.cp,
    localidad: data.localidad,
    marca: data.marca,
    modelo: data.modelo,
    anio: data.anio,
    comision: data.comision ?? data.adquisicion,
    bonificacion: data.bonificacion ?? data.descuento,
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
    const cotizacion = await emitirCotizacionAutomotor(body)
    await informarConsulta({
      evento: "cotizar_automotor",
      status: 201,
      metodo: "POST",
      path: "/api/cotizaciones/automotor",
      mensaje: `OK id ${cotizacion.id}${
        cotizacion.mercantilId ? ` mercantil ${cotizacion.mercantilId}` : ""
      } (${cotizacion.planes.length} planes)`,
      request: quoteAuditContext(body),
      response: {
        id: cotizacion.id,
        mercantilId: cotizacion.mercantilId,
        vehiculoNombre: cotizacion.vehiculoNombre,
        sumaAsegurada: cotizacion.sumaAsegurada,
        planes: cotizacion.planes.length,
      },
    })
    return NextResponse.json(cotizacion, { status: 201 })
  } catch (error) {
    const message =
      error instanceof QuoteServiceError
        ? error.message
        : error instanceof Error
          ? error.message
          : "No se pudo emitir la cotización."
    const status =
      error instanceof QuoteServiceError
        ? error.status
        : message.includes("DATABASE_URL") || message.startsWith("Falta ")
          ? 503
          : 500

    const entry = {
      evento: "cotizar_automotor",
      status,
      metodo: "POST",
      path: "/api/cotizaciones/automotor",
      mensaje: message,
      request: quoteAuditContext(body),
    }
    await informarConsulta(entry)
    await informarAuditoria({ ...entry, contexto: quoteAuditContext(body) })

    return NextResponse.json({ message }, { status })
  }
}
