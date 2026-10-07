import { formatPesos } from "@/lib/format"

export const objetoTipos = ["obra", "notebook", "instrumento", "otros"] as const

export const objetoTipoLabels: Record<(typeof objetoTipos)[number], string> = {
  obra: "Obra de arte",
  notebook: "Notebook",
  instrumento: "Instrumento",
  otros: "Otros",
}

export interface ObjetoFoto {
  nombre: string
  previewUrl?: string
}

interface ObjetoBase {
  id: string
  fotos: ObjetoFoto[]
}

export interface ObjetoObra extends ObjetoBase {
  tipo: "obra"
  valuacion: string
}

export interface ObjetoNotebook extends ObjetoBase {
  tipo: "notebook"
  marcaModelo: string
  serie: string
}

export interface ObjetoInstrumento extends ObjetoBase {
  tipo: "instrumento"
  nombre: string
  marca: string
}

export interface ObjetoOtros extends ObjetoBase {
  tipo: "otros"
  comentario: string
}

export type ObjetoParticular =
  | ObjetoObra
  | ObjetoNotebook
  | ObjetoInstrumento
  | ObjetoOtros

export type ObjetoTipo = ObjetoParticular["tipo"]

export interface ObjetoFieldError {
  itemId: string
  field: string
  message: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function fotosFrom(value: unknown): ObjetoFoto[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((foto) => {
    if (!isRecord(foto) || typeof foto.nombre !== "string" || foto.nombre.length === 0) {
      return []
    }
    return [{ nombre: foto.nombre }]
  })
}

function objetoFrom(value: unknown): ObjetoParticular | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.tipo !== "string") {
    return null
  }

  const id = value.id
  const fotos = fotosFrom(value.fotos)

  switch (value.tipo) {
    case "obra":
      return { id, tipo: "obra", valuacion: text(value.valuacion), fotos }
    case "notebook":
      return {
        id,
        tipo: "notebook",
        marcaModelo: text(value.marcaModelo),
        serie: text(value.serie),
        fotos,
      }
    case "instrumento":
      return {
        id,
        tipo: "instrumento",
        nombre: text(value.nombre),
        marca: text(value.marca),
        fotos,
      }
    case "otros":
      return { id, tipo: "otros", comentario: text(value.comentario), fotos }
    default:
      return null
  }
}

export function decodeObjetos(value: string): ObjetoParticular[] {
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const objeto = objetoFrom(item)
      return objeto ? [objeto] : []
    })
  } catch {
    return []
  }
}

export function encodeObjetos(items: ObjetoParticular[]) {
  if (items.length === 0) return ""

  const documents = items.map((item) => ({
    ...item,
    fotos: item.fotos.map((foto) => ({ nombre: foto.nombre })),
  }))

  return JSON.stringify(documents)
}

export function createObjeto(tipo: ObjetoTipo): ObjetoParticular {
  const id = crypto.randomUUID()
  const fotos: ObjetoFoto[] = []

  switch (tipo) {
    case "obra":
      return { id, tipo, valuacion: "", fotos }
    case "notebook":
      return { id, tipo, marcaModelo: "", serie: "", fotos }
    case "instrumento":
      return { id, tipo, nombre: "", marca: "", fotos }
    case "otros":
      return { id, tipo, comentario: "", fotos }
  }
}

export function validateObjetos(items: ObjetoParticular[]): ObjetoFieldError[] {
  return items.flatMap((item) => {
    switch (item.tipo) {
      case "obra":
        if (!Number.isFinite(Number(item.valuacion)) || Number(item.valuacion) < 1000) {
          return [
            {
              itemId: item.id,
              field: "valuacion",
              message: "Ingresá la valuación.",
            },
          ]
        }
        return []
      case "notebook": {
        const errors: ObjetoFieldError[] = []
        if (item.marcaModelo.trim().length < 2) {
          errors.push({
            itemId: item.id,
            field: "marcaModelo",
            message: "Ingresá marca y modelo.",
          })
        }
        if (item.serie.trim().length < 3) {
          errors.push({
            itemId: item.id,
            field: "serie",
            message: "Ingresá el número de serie.",
          })
        }
        return errors
      }
      case "instrumento": {
        const errors: ObjetoFieldError[] = []
        if (item.nombre.trim().length < 2) {
          errors.push({
            itemId: item.id,
            field: "nombre",
            message: "Ingresá el nombre del instrumento.",
          })
        }
        if (item.marca.trim().length < 2) {
          errors.push({
            itemId: item.id,
            field: "marca",
            message: "Ingresá la marca.",
          })
        }
        return errors
      }
      case "otros":
        if (item.comentario.trim().length < 3) {
          return [
            {
              itemId: item.id,
              field: "comentario",
              message: "Escribí un comentario sobre el bien.",
            },
          ]
        }
        return []
    }
  })
}

function fotoLabel(count: number) {
  if (count === 1) return " · 1 foto"
  if (count > 1) return ` · ${count} fotos`
  return ""
}

export function objetoResumen(item: ObjetoParticular) {
  const fotos = fotoLabel(item.fotos.length)

  switch (item.tipo) {
    case "obra":
      return `Obra de arte · ${formatPesos(Number(item.valuacion))}${fotos}`
    case "notebook":
      return `Notebook · ${item.marcaModelo} · serie ${item.serie}${fotos}`
    case "instrumento":
      return `Instrumento · ${item.nombre} · ${item.marca}${fotos}`
    case "otros":
      return `Otros · ${item.comentario}${fotos}`
  }
}
