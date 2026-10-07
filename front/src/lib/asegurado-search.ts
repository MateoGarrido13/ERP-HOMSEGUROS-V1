import {
  createLoader,
  createSerializer,
  parseAsString,
  type inferParserType,
} from "nuqs/server"

export const aseguradoParsers = {
  nombre: parseAsString.withDefault(""),
  apellido: parseAsString.withDefault(""),
  email: parseAsString.withDefault(""),
  telefono: parseAsString.withDefault(""),
  dni: parseAsString.withDefault(""),
  comentarios: parseAsString.withDefault(""),
}

export type AseguradoSearch = inferParserType<typeof aseguradoParsers>

export const loadAsegurado = createLoader(aseguradoParsers)

export const serializeAsegurado = createSerializer(aseguradoParsers, {
  clearOnDefault: true,
})

export function withAsegurado(href: string, asegurado: AseguradoSearch) {
  const query = serializeAsegurado(asegurado)
  if (!query) return href
  const joiner = href.includes("?") ? "&" : "?"
  return `${href}${joiner}${query.slice(1)}`
}
