import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server"

import { adquisicionPercents, descuentoPercents } from "@/lib/adquisicion"

export const companyIds = ["sancor", "mercantil", "allianz"] as const
export const useIds = ["particular", "comercial"] as const

export const useLabels: Record<(typeof useIds)[number], string> = {
  particular: "Particular",
  comercial: "Comercial",
}

export const quoteParsers = {
  patente: parseAsString.withDefault("AB 123 CD"),
  cp: parseAsString.withDefault("1640"),
  uso: parseAsStringLiteral(useIds).withDefault("particular"),
  anio: parseAsString.withDefault("2022"),
  suma: parseAsString.withDefault("18400000"),
  marca: parseAsString.withDefault(""),
  modelo: parseAsString.withDefault(""),
  localidad: parseAsString.withDefault(""),
  gnc: parseAsBoolean.withDefault(false),
  rastreo: parseAsBoolean.withDefault(false),
  adquisicion: parseAsStringLiteral(adquisicionPercents).withDefault("10"),
  descuento: parseAsStringLiteral(descuentoPercents).withDefault("10"),
  cotizacion: parseAsString.withDefault(""),
  nuevo: parseAsBoolean.withDefault(false),
  compania: parseAsStringLiteral(companyIds).withDefault("sancor"),
  alternativas: parseAsArrayOf(parseAsStringLiteral(companyIds)).withDefault([]),
}

export type QuoteSearch = inferParserType<typeof quoteParsers>
export type CompanyId = (typeof companyIds)[number]
export type UseId = (typeof useIds)[number]

export const loadQuote = createLoader(quoteParsers)

export const serializeQuote = createSerializer(quoteParsers, {
  clearOnDefault: true,
})

export function quoteHref(
  path: string,
  quote: QuoteSearch,
  patch?: Partial<QuoteSearch>,
) {
  return `${path}${serializeQuote({ ...quote, ...patch })}`
}
