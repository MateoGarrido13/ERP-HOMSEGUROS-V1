import { NextResponse } from "next/server"

import { discardAutomotorLead } from "@/services/leads/automotor-leads"
import { getCotizacionAutomotor } from "@/services/mercantil/cotizar-auto.service"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const cotizacion = await getCotizacionAutomotor(id)
  if (!cotizacion) {
    return NextResponse.json({ message: "No encontramos esa cotización." }, { status: 404 })
  }
  return NextResponse.json(cotizacion)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: string } | null
  if (body?.status !== "discarded") {
    return NextResponse.json({ message: "Solo se admite status discarded." }, { status: 400 })
  }
  const ok = await discardAutomotorLead(id)
  if (!ok) {
    return NextResponse.json({ message: "No encontramos esa cotización." }, { status: 404 })
  }
  return NextResponse.json({ id, status: "discarded" })
}
