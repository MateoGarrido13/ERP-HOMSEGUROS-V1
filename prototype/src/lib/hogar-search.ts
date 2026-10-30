import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server"

export const viviendaUsoIds = ["permanente", "temporaria"] as const
export const viviendaTipoIds = ["casa", "departamento", "country"] as const
export const mascotaIds = ["no", "si"] as const

export const viviendaUsoLabels: Record<(typeof viviendaUsoIds)[number], string> = {
  permanente: "Vivienda permanente",
  temporaria: "Vivienda temporaria (vacaciones)",
}

export const viviendaTipoLabels: Record<(typeof viviendaTipoIds)[number], string> = {
  casa: "Casa",
  departamento: "Departamento",
  country: "Casa en barrio cerrado / country",
}

export const mascotaLabels: Record<(typeof mascotaIds)[number], string> = {
  no: "No necesito",
  si: "Sí, quiero sumar mascota/s",
}

export const hogarParsers = {
  uso: parseAsStringLiteral(viviendaUsoIds),
  vivienda: parseAsStringLiteral(viviendaTipoIds),
  cp: parseAsString.withDefault(""),
  metros: parseAsString.withDefault(""),
  contenido: parseAsString.withDefault(""),
  mascotas: parseAsStringLiteral(mascotaIds),
  mascotaDetalle: parseAsString.withDefault(""),
  objetos: parseAsString.withDefault(""),
}

export type HogarSearch = inferParserType<typeof hogarParsers>
export type ViviendaUsoId = (typeof viviendaUsoIds)[number]
export type ViviendaTipoId = (typeof viviendaTipoIds)[number]
export type MascotaId = (typeof mascotaIds)[number]

export function isViviendaUsoId(value: string): value is ViviendaUsoId {
  return viviendaUsoIds.some((id) => id === value)
}

export function isViviendaTipoId(value: string): value is ViviendaTipoId {
  return viviendaTipoIds.some((id) => id === value)
}

export function isMascotaId(value: string): value is MascotaId {
  return mascotaIds.some((id) => id === value)
}

export const loadHogar = createLoader(hogarParsers)

export const serializeHogar = createSerializer(hogarParsers, {
  clearOnDefault: true,
})

export function hogarHref(
  path: string,
  hogar: HogarSearch,
  patch?: Partial<HogarSearch>,
) {
  return `${path}${serializeHogar({ ...hogar, ...patch })}`
}
