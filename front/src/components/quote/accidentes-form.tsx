"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ChoiceField } from "@/components/ui/choice-field"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SelectField, TextField } from "@/components/ui/text-field"
import { digitsOnly, formatPesos } from "@/lib/format"
import {
  accidentesHref,
  documentoIds,
  documentoLabels,
  isDocumentoId,
  isPersonasId,
  personasIds,
  personasLabels,
  type AccidentesSearch,
  type DocumentoId,
  type PersonasId,
} from "@/lib/accidentes-search"

interface AccidentesFormProps {
  accidentes: AccidentesSearch
}

interface AccidentesErrors {
  actividad?: string
  inicio?: string
  fin?: string
  suma?: string
  documento?: string
  numero?: string
  nacimiento?: string
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 border-t border-line pt-3.5">
      <h2 className="text-sm font-medium text-teal-deep">{title}</h2>
      {children}
    </section>
  )
}

function optionsFor<T extends string>(ids: readonly T[], labels: Record<T, string>) {
  return ids.map((id) => ({ id, label: labels[id] }))
}

function isIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  )
}

export function AccidentesForm({ accidentes }: AccidentesFormProps) {
  const router = useRouter()
  const [actividad, setActividad] = useState(accidentes.actividad)
  const [inicio, setInicio] = useState(accidentes.inicio)
  const [fin, setFin] = useState(accidentes.fin)
  const [suma, setSuma] = useState(accidentes.suma)
  const [personas, setPersonas] = useState<PersonasId>(accidentes.personas)
  const [documento, setDocumento] = useState<DocumentoId | null>(accidentes.documento)
  const [numero, setNumero] = useState(accidentes.numero)
  const [nacimiento, setNacimiento] = useState(accidentes.nacimiento)
  const [errors, setErrors] = useState<AccidentesErrors>({})
  const insuredSum = Number(suma)
  const today = new Date().toISOString().slice(0, 10)

  function onNumeroChange(value: string) {
    if (documento === "pasaporte") {
      setNumero(value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12))
      return
    }

    const maxLength = documento === "cuit" ? 11 : 8
    setNumero(digitsOnly(value).slice(0, maxLength))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: AccidentesErrors = {}
    const activity = actividad.trim()
    const documentNumber = numero.trim()

    if (activity.length < 3) nextErrors.actividad = "Ingresá el tipo de actividad."

    if (!isIsoDate(inicio)) nextErrors.inicio = "Ingresá la fecha de inicio."

    if (!isIsoDate(fin)) {
      nextErrors.fin = "Ingresá la fecha de fin."
    } else if (isIsoDate(inicio) && fin < inicio) {
      nextErrors.fin = "La fecha de fin tiene que ser posterior al inicio."
    }

    if (suma && (!Number.isFinite(insuredSum) || insuredSum < 1000)) {
      nextErrors.suma = "Ingresá la suma asegurada."
    }

    if (!documento) nextErrors.documento = "Elegí el tipo de documento."

    if (documento === "dni" && !/^\d{7,8}$/.test(documentNumber)) {
      nextErrors.numero = "El DNI tiene 7 u 8 números."
    } else if (documento === "cuit" && !/^\d{11}$/.test(documentNumber)) {
      nextErrors.numero = "El CUIT tiene 11 números."
    } else if (documento === "pasaporte" && documentNumber.length < 6) {
      nextErrors.numero = "Ingresá el número de pasaporte."
    } else if (!documento && documentNumber.length === 0) {
      nextErrors.numero = "Ingresá el número de documento."
    }

    if (!isIsoDate(nacimiento) || nacimiento >= today) {
      nextErrors.nacimiento = "Ingresá la fecha de nacimiento."
    }

    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document.getElementById(firstError)?.scrollIntoView({ block: "center" })
      return
    }

    if (!documento) return

    router.push(
      accidentesHref("/cotizar/accidentes/asegurado", accidentes, {
        actividad: activity,
        inicio,
        fin,
        suma,
        personas,
        documento,
        numero: documentNumber,
        nacimiento,
      }),
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle>Cotizá accidentes personales</ScreenTitle>

        <FormSection title="1. Tu seguro de accidentes personales">
          <TextField
            label="Tipo de actividad que realizás"
            name="actividad"
            placeholder="Ej: Administrativo, Construcción, Comercio"
            value={actividad}
            onChange={(event) => setActividad(event.target.value)}
            error={errors.actividad}
          />
          <TextField
            label="¿Cuál es la fecha de inicio de tu cobertura?"
            name="inicio"
            type="date"
            value={inicio}
            onChange={(event) => setInicio(event.target.value)}
            error={errors.inicio}
          />
          <TextField
            label="¿Cuál es la fecha de fin de tu cobertura?"
            name="fin"
            type="date"
            value={fin}
            onChange={(event) => setFin(event.target.value)}
            error={errors.fin}
          />
          <TextField
            label="¿Qué suma asegurada necesitás?"
            name="suma"
            inputMode="numeric"
            placeholder="Ej: 5.000.000"
            value={suma ? formatPesos(Number(suma)) : ""}
            onChange={(event) => setSuma(digitsOnly(event.target.value).slice(0, 12))}
            error={errors.suma}
          />
          <SelectField
            label="¿Para cuántas personas necesitás la cotización?"
            name="personas"
            value={personas}
            onChange={(event) => {
              if (isPersonasId(event.target.value)) setPersonas(event.target.value)
            }}
          >
            {personasIds.map((id) => (
              <option key={id} value={id}>
                {personasLabels[id]}
              </option>
            ))}
          </SelectField>
        </FormSection>

        <FormSection title="2. Datos personales">
          <ChoiceField
            label="Tipo de documento"
            name="documento"
            value={documento}
            options={optionsFor(documentoIds, documentoLabels)}
            onChange={(value) => {
              if (!isDocumentoId(value)) return
              setDocumento(value)
              setNumero("")
            }}
            error={errors.documento}
          />
          <TextField
            label="Número de documento"
            name="numero"
            inputMode={documento === "pasaporte" ? "text" : "numeric"}
            autoCapitalize={documento === "pasaporte" ? "characters" : "off"}
            value={numero}
            onChange={(event) => onNumeroChange(event.target.value)}
            error={errors.numero}
          />
          <TextField
            label="Fecha de nacimiento"
            name="nacimiento"
            type="date"
            max={today}
            value={nacimiento}
            onChange={(event) => setNacimiento(event.target.value)}
            error={errors.nacimiento}
          />
        </FormSection>

        <BrandButton type="submit">Continuar</BrandButton>
      </ScreenBody>
    </form>
  )
}
