import {
  resolveGastos,
  type AdquisicionPercent,
  type DescuentoPercent,
} from "@/lib/adquisicion"
import { quoteHref, type QuoteSearch, type UseId } from "@/lib/quote-search"

/** Campos que el formulario manda a cotizar-auto. La localidad y el infoauto los resuelve el servicio. */
export interface AutomotorConsulta {
  patente: string
  cp: string
  localidad: string
  uso: UseId
  marca: string
  modelo: string
  anio: string
  gnc: boolean
  rastreo: boolean
  adquisicion?: AdquisicionPercent
  descuento?: DescuentoPercent
}

/**
 * Misma consulta que POST /cotizaciones/v2/auto del Palio Fire:
 * CP 7000, Tandil (inder 20512), Fiat Palio 1.4 Fire Elx 2007 (infoauto 170499),
 * uso particular, sin GNC y sin rastreo.
 * La patente no viaja en el body de Mercantil; el formulario la pide antes de cotizar.
 */
export const palioFireConsulta: AutomotorConsulta = {
  patente: "FPA 207",
  cp: "7000",
  localidad: "Tandil",
  uso: "particular",
  marca: "Fiat",
  modelo: "Palio 1.4 Fire Elx",
  anio: "2007",
  gnc: false,
  rastreo: false,
}

export function automotorQuoteSearch(consulta: AutomotorConsulta): QuoteSearch {
  const gastos = resolveGastos(consulta.adquisicion, consulta.descuento)
  return {
    patente: consulta.patente,
    cp: consulta.cp,
    uso: consulta.uso,
    anio: consulta.anio,
    suma: "18400000",
    marca: consulta.marca,
    modelo: consulta.modelo,
    localidad: consulta.localidad,
    gnc: consulta.gnc,
    rastreo: consulta.rastreo,
    adquisicion: gastos.adquisicion,
    descuento: gastos.descuento,
    cotizacion: "",
    nuevo: false,
    compania: "mercantil",
    alternativas: [],
  }
}

export function automotorQuoteHref(path: string, consulta: AutomotorConsulta) {
  return quoteHref(path, automotorQuoteSearch(consulta))
}
