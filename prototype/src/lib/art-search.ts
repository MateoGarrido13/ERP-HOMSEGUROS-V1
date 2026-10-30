import {
  createLoader,
  createSerializer,
  parseAsString,
  type inferParserType,
} from "nuqs/server"

export const artParsers = {
  empresa: parseAsString.withDefault(""),
  cuit: parseAsString.withDefault(""),
  actividad: parseAsString.withDefault(""),
  empleados: parseAsString.withDefault(""),
  masa: parseAsString.withDefault(""),
  archivo: parseAsString.withDefault(""),
  cargo: parseAsString.withDefault(""),
}

export type ArtSearch = inferParserType<typeof artParsers>

export const loadArt = createLoader(artParsers)

export const serializeArt = createSerializer(artParsers, {
  clearOnDefault: true,
})

export function artHref(path: string, art: ArtSearch, patch?: Partial<ArtSearch>) {
  return `${path}${serializeArt({ ...art, ...patch })}`
}

export function formatCuit(digits: string) {
  const value = digits.replace(/\D/g, "").slice(0, 11)
  if (value.length <= 2) return value
  if (value.length <= 10) return `${value.slice(0, 2)}-${value.slice(2)}`
  return `${value.slice(0, 2)}-${value.slice(2, 10)}-${value.slice(10)}`
}
