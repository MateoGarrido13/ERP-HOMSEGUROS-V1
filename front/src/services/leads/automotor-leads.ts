import "server-only"

import { cotizacionRepository } from "@/db/repositories"
import type { CotizacionPlanRecord, CotizacionWithPlanes } from "@/db/types"
import { gastosFromPercents } from "@/lib/adquisicion"
import { formatPesos } from "@/lib/format"
import type { Lead } from "@/lib/leads"
import type { UseId } from "@/lib/quote-search"

function featuredPlan(planes: CotizacionPlanRecord[]) {
  return (
    planes.find((plan) => plan.producto === "M BASICA") ??
    planes.find((plan) => plan.producto === "B") ??
    planes.find((plan) => plan.costo > 0) ??
    planes[0]
  )
}

function usoFromApi(uso: number): UseId {
  return uso === 2 ? "comercial" : "particular"
}

export function leadFromCotizacion(record: CotizacionWithPlanes): Lead {
  const plan = featuredPlan(record.planes)
  const vehicle =
    record.vehiculoNombre?.trim() ||
    [record.marca, record.modelo].filter(Boolean).join(" ").trim() ||
    "Vehículo"
  const patente = record.patente?.trim() ?? ""
  const localidad = record.localidadNombre?.trim() ?? ""
  const premium = plan ? formatPesos(plan.costo) : ""
  const coverage = plan?.texto || plan?.producto || "Automotor"
  const day = record.createdAt.slice(0, 10)
  const gastos = gastosFromPercents(record.comision, record.bonificacion)

  const description = [
    patente ? `Patente ${patente}.` : null,
    localidad
      ? `Riesgo en ${localidad}${record.codigoPostal ? ` (CP ${record.codigoPostal})` : ""}.`
      : null,
    record.mercantilCotizacionId ? `Consulta Mercantil ${record.mercantilCotizacionId}.` : null,
    plan ? `Se cotizó ${coverage} en Mercantil Andina por ${premium}.` : null,
    `${record.planes.length} plan${record.planes.length === 1 ? "" : "es"} en la respuesta.`,
  ]
    .filter(Boolean)
    .join(" ")

  return {
    id: record.id,
    holder: vehicle,
    ramo: "Automotor",
    origin: "Cotización enviada",
    description,
    phone: "",
    phoneHref: "",
    updatedOn: day,
    quotePath: "/cotizar/automotor",
    proposal: plan
      ? {
          good: vehicle,
          coverage,
          company: "Mercantil Andina",
          premium,
        }
      : undefined,
    automotor: {
      patente: patente || "AA 000 AA",
      cp: String(record.codigoPostal).padStart(4, "0"),
      localidad,
      uso: usoFromApi(record.uso),
      marca: record.marca ?? "",
      modelo: record.modelo ?? "",
      anio: String(record.anio),
      gnc: record.gnc,
      rastreo: record.rastreo > 0,
      adquisicion: gastos.adquisicion,
      descuento: gastos.descuento,
    },
  }
}

export async function listAutomotorLeads() {
  const quotes = await cotizacionRepository.listQuoted({
    company: "mercantil",
    ramo: "automotor",
  })
  return quotes.map(leadFromCotizacion)
}

export async function discardAutomotorLead(id: string) {
  const updated = await cotizacionRepository.updateStatus(id, "discarded")
  if (!updated) return false
  return true
}
