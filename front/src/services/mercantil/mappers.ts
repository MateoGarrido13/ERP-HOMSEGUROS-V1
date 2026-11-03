import type { CotizacionWithPlanes } from "@/db/types"
import type {
  CotizacionView,
  CotizarAutomotorInput,
  MercantilCotizacionResponse,
  MercantilLocalidad,
  MercantilVehiculo,
} from "@/services/mercantil/types"

export function usoToApi(uso: CotizarAutomotorInput["uso"]) {
  return uso === "comercial" ? 2 : 1
}

export function pickLocalidad(rows: MercantilLocalidad[], codigoPostal: number) {
  return (
    rows.find((row) => Number(row.codigoPostal) === codigoPostal) ??
    rows[0] ??
    null
  )
}

function modelTokens(modelo: string) {
  return modelo
    .toUpperCase()
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

export function pickVehiculo(rows: MercantilVehiculo[], modelo: string) {
  if (rows.length === 0) return null

  const tokens = modelTokens(modelo)
  const ranked = rows
    .map((row) => {
      const name = row.nombre.toUpperCase()
      const hits = tokens.filter((token) => name.includes(token)).length
      return { row, hits }
    })
    .sort((left, right) => right.hits - left.hits)

  const best = ranked[0]
  if (!best) return null
  const needed = Math.min(3, tokens.length)
  if (tokens.length > 0 && best.hits < needed) return null
  return best.row
}

export function toCotizacionView(record: CotizacionWithPlanes): CotizacionView {
  return {
    id: record.id,
    mercantilId: record.mercantilCotizacionId,
    localidadNombre: record.localidadNombre ?? "",
    provincia: record.provincia ?? "",
    codigoPostal: record.codigoPostal,
    vehiculoNombre: record.vehiculoNombre ?? [record.marca, record.modelo].filter(Boolean).join(" "),
    anio: record.anio,
    infoauto: record.infoauto,
    sumaAsegurada: record.sumaAsegurada,
    patente: record.patente,
    uso: record.uso,
    gnc: record.gnc,
    planes: record.planes.map((plan) => ({
      numero: plan.numero,
      producto: plan.producto ?? "",
      codigoProducto: plan.codigoProducto,
      titulo: plan.titulo ?? plan.producto ?? "",
      texto: plan.texto ?? plan.descripcion ?? "",
      costo: plan.costo,
      franquicia: plan.franquicia,
      cantidadCuotas: plan.cantidadCuotas,
    })),
  }
}

export function planesFromResponse(response: MercantilCotizacionResponse) {
  return (response.resultado ?? []).map((plan) => ({
    numero: plan.numero,
    producto: plan.producto ?? null,
    codigoProducto: plan.codigo_producto ?? null,
    titulo: plan.titulo ?? null,
    descripcion: plan.descripcion ?? null,
    texto: plan.texto ?? null,
    costo: plan.costo,
    franquicia: plan.franquicia ?? null,
    cantidadCuotas: plan.cantidad_cuotas ?? null,
    puntaje: plan.puntaje ?? null,
    error: plan.error || null,
    desglose: plan.desglose ?? null,
  }))
}
