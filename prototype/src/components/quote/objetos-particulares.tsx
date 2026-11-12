"use client"

import { useState } from "react"

import { TextArea, TextField } from "@/components/ui/text-field"
import { cn } from "@/lib/cn"
import { digitsOnly, formatPesos } from "@/lib/format"
import {
  createObjeto,
  objetoResumen,
  objetoTipoLabels,
  objetoTipos,
  validateObjetos,
  type ObjetoFieldError,
  type ObjetoFoto,
  type ObjetoParticular,
  type ObjetoTipo,
} from "@/lib/objetos-particulares"

interface ObjetosParticularesProps {
  items: ObjetoParticular[]
  errors: ObjetoFieldError[]
  onChange: (items: ObjetoParticular[]) => void
}

function errorFor(errors: ObjetoFieldError[], itemId: string, field: string) {
  return errors.find((error) => error.itemId === itemId && error.field === field)?.message
}

function addFotos(current: ObjetoFoto[], files: FileList | null) {
  if (!files) return current

  const next = [...files]
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, Math.max(0, 4 - current.length))
    .map((file) => ({
      nombre: file.name,
      previewUrl: URL.createObjectURL(file),
    }))

  return next.length > 0 ? [...current, ...next] : current
}

function releaseFotos(fotos: ObjetoFoto[]) {
  for (const foto of fotos) {
    if (foto.previewUrl) URL.revokeObjectURL(foto.previewUrl)
  }
}

function ItemDropzone({
  fotos,
  onChange,
}: {
  fotos: ObjetoFoto[]
  onChange: (fotos: ObjetoFoto[]) => void
}) {
  const [isOver, setIsOver] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-light text-body">
        Fotos <span className="text-muted">(opcional)</span>
      </p>
      {fotos.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {fotos.map((foto, index) => (
            <li key={`${foto.nombre}-${index}`} className="relative">
              {foto.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto.previewUrl} alt="" className="size-12 rounded-[6px] object-cover" />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-lg bg-stage text-[10px] text-muted">
                  IMG
                </span>
              )}
              <button
                type="button"
                aria-label={`Quitar ${foto.nombre}`}
                onClick={() => {
                  const removed = fotos[index]
                  if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
                  onChange(fotos.filter((_, photoIndex) => photoIndex !== index))
                }}
                className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-secondary text-[10px] leading-none text-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {fotos.length < 4 ? (
        <label
          onDragOver={(event) => {
            event.preventDefault()
            setIsOver(true)
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsOver(false)
            onChange(addFotos(fotos, event.dataTransfer.files))
          }}
          className={cn(
            "flex h-14 cursor-pointer items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs text-hint",
            isOver ? "border-primary bg-mint" : "border-field bg-white",
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              onChange(addFotos(fotos, event.target.files))
              event.target.value = ""
            }}
          />
          Agregar imagen
        </label>
      ) : null}
    </div>
  )
}

function ItemFields({
  item,
  errors,
  onChange,
}: {
  item: ObjetoParticular
  errors: ObjetoFieldError[]
  onChange: (item: ObjetoParticular) => void
}) {
  switch (item.tipo) {
    case "notebook":
      return (
        <>
          <TextField
            label="Marca-Modelo"
            name={`marcaModelo-${item.id}`}
            value={item.marcaModelo}
            onChange={(event) => onChange({ ...item, marcaModelo: event.target.value })}
            error={errorFor(errors, item.id, "marcaModelo")}
          />
          <TextField
            label="Número de serie"
            name={`serie-${item.id}`}
            value={item.serie}
            onChange={(event) => onChange({ ...item, serie: event.target.value })}
            error={errorFor(errors, item.id, "serie")}
          />
        </>
      )
    case "obra":
      return (
        <TextField
          label="Valuación"
          name={`valuacion-${item.id}`}
          inputMode="numeric"
          placeholder="Ej: 1.200.000"
          value={item.valuacion ? formatPesos(Number(item.valuacion)) : ""}
          onChange={(event) =>
            onChange({ ...item, valuacion: digitsOnly(event.target.value).slice(0, 12) })
          }
          error={errorFor(errors, item.id, "valuacion")}
        />
      )
    case "instrumento":
      return (
        <>
          <TextField
            label="Nombre"
            name={`nombre-${item.id}`}
            value={item.nombre}
            onChange={(event) => onChange({ ...item, nombre: event.target.value })}
            error={errorFor(errors, item.id, "nombre")}
          />
          <TextField
            label="Marca"
            name={`marca-${item.id}`}
            value={item.marca}
            onChange={(event) => onChange({ ...item, marca: event.target.value })}
            error={errorFor(errors, item.id, "marca")}
          />
        </>
      )
    case "otros":
      return (
        <TextArea
          label="Comentario"
          name={`comentario-${item.id}`}
          placeholder="Describí el bien"
          value={item.comentario}
          onChange={(event) => onChange({ ...item, comentario: event.target.value })}
          error={errorFor(errors, item.id, "comentario")}
        />
      )
  }
}

export function ObjetosParticulares({ items, errors, onChange }: ObjetosParticularesProps) {
  const [isPicking, setIsPicking] = useState(false)
  const [openIds, setOpenIds] = useState<string[]>([])
  const [draftErrors, setDraftErrors] = useState<ObjetoFieldError[]>([])
  const fieldErrors = draftErrors.length > 0 ? draftErrors : errors

  function replace(item: ObjetoParticular) {
    setOpenIds((current) => (current.includes(item.id) ? current : [...current, item.id]))
    setDraftErrors((current) => current.filter((error) => error.itemId !== item.id))
    onChange(items.map((current) => (current.id === item.id ? item : current)))
  }

  function remove(item: ObjetoParticular) {
    releaseFotos(item.fotos)
    setOpenIds((current) => current.filter((id) => id !== item.id))
    setDraftErrors((current) => current.filter((error) => error.itemId !== item.id))
    onChange(items.filter((current) => current.id !== item.id))
  }

  function add(tipo: ObjetoTipo) {
    const item = createObjeto(tipo)
    setOpenIds((current) => [...current, item.id])
    onChange([...items, item])
    setIsPicking(false)
  }

  function confirm(item: ObjetoParticular) {
    const itemErrors = validateObjetos([item])
    if (itemErrors.length > 0) {
      setDraftErrors(itemErrors)
      return
    }

    setDraftErrors((current) => current.filter((error) => error.itemId !== item.id))
    setOpenIds((current) => current.filter((id) => id !== item.id))
  }

  return (
    <div id="objetos" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-light text-body">Objetos particulares</p>
        <p className="text-xs font-light text-muted">Opcional</p>
      </div>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id)

        if (!isOpen) {
          return (
            <article
              key={item.id}
              id={`objeto-${item.id}`}
              className="flex items-start justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2.5"
            >
              <p className="text-sm font-medium text-ink">{objetoResumen(item)}</p>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => setOpenIds((current) => [...current, item.id])}
                  className="text-xs font-medium text-teal-deep"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="text-xs font-medium text-secondary"
                >
                  Quitar
                </button>
              </div>
            </article>
          )
        }

        return (
          <article
            key={item.id}
            id={`objeto-${item.id}`}
            className="flex flex-col gap-3 rounded-xl border border-line bg-white p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{objetoTipoLabels[item.tipo]}</p>
              <button
                type="button"
                onClick={() => remove(item)}
                className="text-xs font-medium text-secondary"
              >
                Quitar
              </button>
            </div>
            <ItemFields item={item} errors={fieldErrors} onChange={replace} />
            <ItemDropzone
              fotos={item.fotos}
              onChange={(fotos) => replace({ ...item, fotos })}
            />
            <button
              type="button"
              onClick={() => confirm(item)}
              className="flex h-10 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-deep"
            >
              Confirmar
            </button>
          </article>
        )
      })}
      {isPicking ? (
        <div className="grid grid-cols-2 gap-2">
          {objetoTipos.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => add(tipo)}
              className="rounded-lg border border-field bg-white px-3 py-2.5 text-sm font-medium text-title"
            >
              {objetoTipoLabels[tipo]}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsPicking((current) => !current)}
        className="flex h-10 w-full items-center justify-center rounded-full border border-field-line bg-white px-5 text-sm font-medium text-title"
      >
        {isPicking ? "Cancelar" : "+ ítem"}
      </button>
    </div>
  )
}
