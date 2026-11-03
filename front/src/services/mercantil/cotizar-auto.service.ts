import "server-only"

import { cotizacionRepository } from "@/db/repositories"
import { isAllowedGastos } from "@/lib/adquisicion"
import {
  mercantilErrorCode,
  postCotizarAuto,
  searchLocalidades,
  searchVehiculos,
} from "@/services/mercantil/client"
import { mercantilConfig } from "@/services/mercantil/config"
import {
  planesFromResponse,
  pickLocalidad,
  pickVehiculo,
  toCotizacionView,
  usoToApi,
} from "@/services/mercantil/mappers"
import {
  QuoteServiceError,
  type CotizacionView,
  type CotizarAutomotorInput,
} from "@/services/mercantil/types"
import { vehicleSearchQueries } from "@/services/mercantil/vehicle-query"

function digits(value: string) {
  return value.replace(/\D/g, "")
}

function optionalPercent(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new QuoteServiceError("El porcentaje de adquisición o descuento no es válido.")
  }
  return parsed
}

export function parseCotizarAutomotorInput(body: unknown): CotizarAutomotorInput {
  if (!body || typeof body !== "object") {
    throw new QuoteServiceError("El cuerpo de la cotización es inválido.")
  }

  const data = body as Record<string, unknown>
  const patente = String(data.patente ?? "").trim().toUpperCase()
  const cp = digits(String(data.cp ?? ""))
  const localidad = String(data.localidad ?? "").trim()
  const uso = data.uso === "comercial" ? "comercial" : "particular"
  const marca = String(data.marca ?? "").trim()
  const modelo = String(data.modelo ?? "").trim()
  const anio = digits(String(data.anio ?? ""))
  const gnc = Boolean(data.gnc)
  const rastreo = Boolean(data.rastreo)
  const comision = optionalPercent(data.comision ?? data.adquisicion)
  const bonificacion = optionalPercent(data.bonificacion ?? data.descuento)
  const year = Number(anio)
  const currentYear = new Date().getFullYear() + 1

  if (!/^[A-Z0-9]{2,3}\s?[0-9]{3}\s?[A-Z]{0,3}$/.test(patente.replace(/\s+/g, " "))) {
    throw new QuoteServiceError("Ingresá la patente, por ejemplo AB 123 CD.")
  }
  if (!/^\d{4}$/.test(cp)) {
    throw new QuoteServiceError("El código postal tiene 4 números.")
  }
  if (localidad.length < 2) throw new QuoteServiceError("Ingresá la localidad.")
  if (marca.length < 2) throw new QuoteServiceError("Ingresá la marca.")
  if (modelo.length < 2) throw new QuoteServiceError("Ingresá el modelo.")
  if (!/^\d{4}$/.test(anio) || year < 1980 || year > currentYear) {
    throw new QuoteServiceError("Ingresá un año de 4 dígitos.")
  }
  if ((comision === undefined) !== (bonificacion === undefined)) {
    throw new QuoteServiceError("Indicá adquisición y descuento.")
  }
  if (
    comision !== undefined &&
    bonificacion !== undefined &&
    !isAllowedGastos(comision, bonificacion)
  ) {
    throw new QuoteServiceError("Esa combinación de adquisición y descuento no está habilitada.")
  }

  return { patente, cp, localidad, uso, marca, modelo, anio, gnc, rastreo, comision, bonificacion }
}

async function resolveLocalidad(cp: string, nombre?: string) {
  const codigoPostal = Number(cp)
  const queries = [nombre, cp].filter((value): value is string => Boolean(value))
  for (const query of queries) {
    const rows = await searchLocalidades(query)
    const match = pickLocalidad(rows, codigoPostal)
    if (match) return match
  }
  throw new QuoteServiceError("No encontramos la localidad para ese código postal.")
}

function isQueryTooLong(error: unknown) {
  if (!(error instanceof QuoteServiceError)) return false
  return (
    error.code === "ERR0014" ||
    error.message.includes("demasiados caracteres")
  )
}

async function resolveVehiculo(marca: string, modelo: string, anio: number) {
  const queries = vehicleSearchQueries(marca, modelo)
  if (queries.length === 0) {
    throw new QuoteServiceError("Ingresá marca y modelo para buscar el vehículo.")
  }

  for (const query of queries) {
    try {
      const rows = await searchVehiculos(query, anio)
      const match = pickVehiculo(rows, modelo)
      if (match) return match
    } catch (error) {
      if (isQueryTooLong(error) || mercantilErrorCode(error) === "ERR0014") {
        continue
      }
      throw error
    }
  }

  throw new QuoteServiceError("No encontramos ese vehículo en InfoAuto para el año indicado.")
}

export async function emitirCotizacionAutomotor(raw: unknown) {
  const input = parseCotizarAutomotorInput(raw)
  const config = mercantilConfig()
  const anio = Number(input.anio)
  const [localidad, vehiculo] = await Promise.all([
    resolveLocalidad(input.cp, input.localidad),
    resolveVehiculo(input.marca, input.modelo, anio),
  ])

  const comision = 10
  const bonificacion = 10

  const requestPayload = {
    localidad: {
      codigo_postal: Number(input.cp),
      id: localidad.inder,
    },
    vehiculo: {
      infoauto: vehiculo.infoauto,
      anio,
      uso: usoToApi(input.uso),
      gnc: input.gnc,
      rastreo: input.rastreo ? 1 : 0,
    },
    comision,
    bonificacion,
    periodo: config.periodo,
    cuotas: config.cuotas,
    pago: { tipo_pago: config.tipoPago },
    ajuste_suma: 0,
    iva: config.iva,
    desglose: true,
    productor: { id: config.productorId },
  }

  const response = await postCotizarAuto(requestPayload)
  const saved = await cotizacionRepository.insertWithPlanes(
    {
      patente: input.patente,
      codigoPostal: Number(input.cp),
      localidadId: response.localidad?.id ?? localidad.inder,
      localidadNombre: response.localidad?.nombre ?? localidad.nombre,
      provincia: response.localidad?.provincia ?? localidad.nombreProvincia,
      uso: requestPayload.vehiculo.uso,
      marca: input.marca,
      modelo: input.modelo,
      anio,
      gnc: input.gnc,
      rastreo: requestPayload.vehiculo.rastreo,
      iva: config.iva,
      comision,
      bonificacion,
      periodo: config.periodo,
      cuotas: config.cuotas,
      tipoPago: config.tipoPago,
      productorId: config.productorId,
      productorNombre: response.productor?.nombre?.trim() ?? null,
      mercantilCotizacionId: response.id,
      rama: response.rama ?? null,
      infoauto: response.vehiculo?.infoauto ?? vehiculo.infoauto,
      vehiculoId: response.vehiculo?.id ?? vehiculo.codigo,
      vehiculoNombre: response.vehiculo?.nombre ?? vehiculo.nombre,
      sumaAsegurada: response.suma_asegurada ?? null,
      requestPayload,
      responsePayload: response,
    },
    planesFromResponse(response),
  )

  return toCotizacionView(saved)
}

export async function getCotizacionAutomotor(id: string) {
  if (!id) return null
  const record = await cotizacionRepository.findById(id)
  return record ? toCotizacionView(record) : null
}

function plateKey(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, "").toUpperCase()
}

function mercantilMatchesConsulta(
  view: CotizacionView,
  consulta: { patente: string; marca: string; anio: string },
) {
  const wantedPlate = plateKey(consulta.patente)
  const storedPlate = plateKey(view.patente)
  if (wantedPlate && storedPlate && wantedPlate !== storedPlate) return false
  if (consulta.anio && String(view.anio) !== consulta.anio) return false
  const marca = consulta.marca.trim().toUpperCase()
  if (marca && view.vehiculoNombre && !view.vehiculoNombre.toUpperCase().includes(marca)) {
    return false
  }
  return true
}

export async function loadMercantilForConsulta(consulta: {
  cotizacion: string
  patente: string
  marca: string
  modelo: string
  anio: string
}) {
  if (consulta.cotizacion) {
    const byId = await getCotizacionAutomotor(consulta.cotizacion)
    if (byId && mercantilMatchesConsulta(byId, consulta)) return byId
  }

  const anio = Number(consulta.anio)
  const record = await cotizacionRepository.findLatestQuotedByConsulta({
    patente: consulta.patente,
    marca: consulta.marca,
    anio: Number.isFinite(anio) ? anio : undefined,
  })
  return record ? toCotizacionView(record) : null
}
