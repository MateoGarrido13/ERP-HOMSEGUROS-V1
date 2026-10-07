"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"

import { ObjetosParticulares } from "@/components/quote/objetos-particulares"
import { BrandButton } from "@/components/ui/brand-button"
import { ChoiceField } from "@/components/ui/choice-field"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { TextField } from "@/components/ui/text-field"
import { digitsOnly, formatPesos } from "@/lib/format"
import {
  decodeObjetos,
  encodeObjetos,
  validateObjetos,
  type ObjetoFieldError,
  type ObjetoParticular,
} from "@/lib/objetos-particulares"
import {
  hogarHref,
  isMascotaId,
  isViviendaTipoId,
  isViviendaUsoId,
  mascotaIds,
  mascotaLabels,
  viviendaTipoIds,
  viviendaTipoLabels,
  viviendaUsoIds,
  viviendaUsoLabels,
  type HogarSearch,
  type MascotaId,
  type ViviendaTipoId,
  type ViviendaUsoId,
} from "@/lib/hogar-search"

interface HogarFormProps {
  hogar: HogarSearch
}

interface HogarErrors {
  uso?: string
  vivienda?: string
  cp?: string
  metros?: string
  contenido?: string
  mascotas?: string
  mascotaDetalle?: string
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

export function HogarForm({ hogar }: HogarFormProps) {
  const router = useRouter()
  const [uso, setUso] = useState<ViviendaUsoId | null>(hogar.uso)
  const [vivienda, setVivienda] = useState<ViviendaTipoId | null>(hogar.vivienda)
  const [cp, setCp] = useState(hogar.cp)
  const [metros, setMetros] = useState(hogar.metros)
  const [contenido, setContenido] = useState(hogar.contenido)
  const [mascotas, setMascotas] = useState<MascotaId | null>(hogar.mascotas)
  const [mascotaDetalle, setMascotaDetalle] = useState(hogar.mascotaDetalle)
  const [objetos, setObjetos] = useState<ObjetoParticular[]>(() => decodeObjetos(hogar.objetos))
  const [objetoErrores, setObjetoErrores] = useState<ObjetoFieldError[]>([])
  const [errors, setErrors] = useState<HogarErrors>({})
  const insuredContent = Number(contenido)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: HogarErrors = {}
    const postalCode = cp.trim()
    const squareMeters = Number(metros)
    const petDetail = mascotaDetalle.trim()

    if (!uso) nextErrors.uso = "Elegí el uso de la propiedad."
    if (!vivienda) nextErrors.vivienda = "Elegí el tipo de vivienda."

    if (!/^\d{4}$/.test(postalCode)) {
      nextErrors.cp = "El código postal tiene 4 números."
    }

    if (!/^\d{1,5}$/.test(metros) || squareMeters < 1) {
      nextErrors.metros = "Ingresá los metros cuadrados."
    }

    if (!Number.isFinite(insuredContent) || insuredContent < 1000) {
      nextErrors.contenido = "Ingresá la suma del contenido."
    }

    if (!mascotas) nextErrors.mascotas = "Indicá si querés cubrir mascotas."

    if (mascotas === "si" && petDetail.length < 3) {
      nextErrors.mascotaDetalle = "Indicá el tipo de mascota y la cantidad."
    }

    const nextObjetoErrores = validateObjetos(objetos)
    setErrors(nextErrors)
    setObjetoErrores(nextObjetoErrores)
    const firstError = Object.keys(nextErrors)[0]
    const firstObjeto = nextObjetoErrores[0]
    if (firstError) {
      document.getElementById(firstError)?.scrollIntoView({ block: "center" })
      return
    }
    if (firstObjeto) {
      document.getElementById(`objeto-${firstObjeto.itemId}`)?.scrollIntoView({ block: "center" })
      return
    }

    if (!uso || !vivienda || !mascotas) return

    router.push(
      hogarHref("/cotizar/hogar/asegurado", hogar, {
        uso,
        vivienda,
        cp: postalCode,
        metros,
        contenido,
        mascotas,
        mascotaDetalle: mascotas === "si" ? petDetail : "",
        objetos: encodeObjetos(objetos),
      }),
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle>Cotizá el hogar</ScreenTitle>

        <FormSection title="1. Tipo de vivienda y uso">
          <ChoiceField
            label="¿Qué tipo de uso tiene la propiedad?"
            name="uso"
            value={uso}
            options={optionsFor(viviendaUsoIds, viviendaUsoLabels)}
            onChange={(value) => {
              if (isViviendaUsoId(value)) setUso(value)
            }}
            error={errors.uso}
          />
          <ChoiceField
            label="Tipo de vivienda"
            name="vivienda"
            value={vivienda}
            options={optionsFor(viviendaTipoIds, viviendaTipoLabels)}
            onChange={(value) => {
              if (isViviendaTipoId(value)) setVivienda(value)
            }}
            error={errors.vivienda}
          />
          <TextField
            label="¿Cuál es el código postal (CP) de la ubicación del riesgo?"
            name="cp"
            inputMode="numeric"
            maxLength={4}
            placeholder="Ej: 7000"
            value={cp}
            autoComplete="postal-code"
            onChange={(event) => setCp(digitsOnly(event.target.value).slice(0, 4))}
            error={errors.cp}
          />
        </FormSection>

        <FormSection title="2. Coberturas y sumas aseguradas">
          <TextField
            label="¿Cuántos metros cuadrados (m²) cubiertos y semicubiertos tiene la propiedad?"
            name="metros"
            inputMode="numeric"
            maxLength={5}
            placeholder="Ej: 120"
            value={metros}
            onChange={(event) => setMetros(digitsOnly(event.target.value).slice(0, 5))}
            error={errors.metros}
          />
          <TextField
            label="¿Cuál es la suma para el contenido general (muebles, electrodomésticos)?"
            name="contenido"
            inputMode="numeric"
            placeholder="Ej: 8.000.000"
            value={contenido ? formatPesos(Number(contenido)) : ""}
            onChange={(event) => setContenido(digitsOnly(event.target.value).slice(0, 12))}
            error={errors.contenido}
          />
        </FormSection>

        <FormSection title="3. Coberturas adicionales">
          <ChoiceField
            label="¿Querés sumar cobertura para mascotas en tu seguro de hogar?"
            name="mascotas"
            value={mascotas}
            options={optionsFor(mascotaIds, mascotaLabels)}
            onChange={(value) => {
              if (!isMascotaId(value)) return
              setMascotas(value)
              if (value === "no") setMascotaDetalle("")
            }}
            error={errors.mascotas}
          />
          {mascotas === "si" ? (
            <TextField
              label="Indicanos qué tipo de mascota tenés y cantidad"
              name="mascotaDetalle"
              placeholder="Ej: 1 perro y 1 gato"
              value={mascotaDetalle}
              onChange={(event) => setMascotaDetalle(event.target.value)}
              error={errors.mascotaDetalle}
            />
          ) : null}
          <ObjetosParticulares
            items={objetos}
            errors={objetoErrores}
            onChange={(next) => {
              setObjetos(next)
              setObjetoErrores([])
            }}
          />
        </FormSection>

        <BrandButton type="submit">Continuar</BrandButton>
      </ScreenBody>
    </form>
  )
}
