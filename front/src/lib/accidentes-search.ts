import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server"

export const personasIds = ["una", "dos-cinco", "seis-diez", "mas-diez"] as const
export const documentoIds = ["dni", "pasaporte", "cuit"] as const

export const personasLabels: Record<(typeof personasIds)[number], string> = {
  una: "1 persona",
  "dos-cinco": "De 2 a 5 personas",
  "seis-diez": "De 6 a 10 personas",
  "mas-diez": "Más de 10 personas",
}

export const documentoLabels: Record<(typeof documentoIds)[number], string> = {
  dni: "DNI",
  pasaporte: "Pasaporte",
  cuit: "CUIT",
}

export const accidentesParsers = {
  actividad: parseAsString.withDefault(""),
  inicio: parseAsString.withDefault(""),
  fin: parseAsString.withDefault(""),
  suma: parseAsString.withDefault(""),
  personas: parseAsStringLiteral(personasIds).withDefault("una"),
  documento: parseAsStringLiteral(documentoIds),
  numero: parseAsString.withDefault(""),
  nacimiento: parseAsString.withDefault(""),
}

export type AccidentesSearch = inferParserType<typeof accidentesParsers>
export type PersonasId = (typeof personasIds)[number]
export type DocumentoId = (typeof documentoIds)[number]

export function isPersonasId(value: string): value is PersonasId {
  return personasIds.some((id) => id === value)
}

export function isDocumentoId(value: string): value is DocumentoId {
  return documentoIds.some((id) => id === value)
}

export const loadAccidentes = createLoader(accidentesParsers)

export const serializeAccidentes = createSerializer(accidentesParsers, {
  clearOnDefault: true,
})

export function accidentesHref(
  path: string,
  accidentes: AccidentesSearch,
  patch?: Partial<AccidentesSearch>,
) {
  return `${path}${serializeAccidentes({ ...accidentes, ...patch })}`
}
