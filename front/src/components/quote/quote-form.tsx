"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SelectField, TextField } from "@/components/ui/text-field"
import { Toggle } from "@/components/ui/toggle"
import {
  adquisicionLabel,
  adquisicionPercents,
  descuentoLabel,
  descuentosForAdquisicion,
  isAdquisicionPercent,
  isDescuentoPercent,
  resolveGastos,
  type AdquisicionPercent,
  type DescuentoPercent,
} from "@/lib/adquisicion"
import { digitsOnly } from "@/lib/format"
import {
  quoteHref,
  useIds,
  useLabels,
  type QuoteSearch,
  type UseId,
} from "@/lib/quote-search"
import type { CotizacionView } from "@/services/mercantil/types"

interface QuoteFormProps {
  quote: QuoteSearch
}

interface QuoteErrors {
  patente?: string
  cp?: string
  localidad?: string
  marca?: string
  modelo?: string
  anio?: string
}

function isUseId(value: string): value is UseId {
  return useIds.some((id) => id === value)
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const router = useRouter()
  const precargado = Boolean(quote.marca.trim() && quote.modelo.trim())
  const initialGastos = resolveGastos(quote.adquisicion, quote.descuento)
  const [patente, setPatente] = useState(precargado ? quote.patente : "")
  const [cp, setCp] = useState(precargado ? quote.cp : "")
  const [localidad, setLocalidad] = useState(quote.localidad)
  const [uso, setUso] = useState<UseId>(quote.uso)
  const [marca, setMarca] = useState(quote.marca)
  const [modelo, setModelo] = useState(quote.modelo)
  const [anio, setAnio] = useState(precargado ? quote.anio : "")
  const [gnc, setGnc] = useState(quote.gnc)
  const [rastreo, setRastreo] = useState(quote.rastreo)
  const [adquisicion, setAdquisicion] = useState<AdquisicionPercent>(initialGastos.adquisicion)
  const [descuento, setDescuento] = useState<DescuentoPercent>(initialGastos.descuento)
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const gastos = resolveGastos(adquisicion, descuento)
  const descuentoOpciones = descuentosForAdquisicion(adquisicion)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: QuoteErrors = {}
    const plate = patente.trim().toUpperCase()
    const postalCode = cp.trim()
    const city = localidad.trim()
    const brand = marca.trim()
    const line = modelo.trim()
    const year = Number(anio)
    const currentYear = new Date().getFullYear() + 1

    if (!/^[A-Z0-9]{2,3}\s?[0-9]{3}\s?[A-Z]{0,3}$/.test(plate.replace(/\s+/g, " "))) {
      nextErrors.patente = "Ingresá la patente, por ejemplo NSY122."
    }
    if (!/^\d{4}$/.test(postalCode)) {
      nextErrors.cp = "El código postal tiene 4 números."
    }
    if (city.length < 2) nextErrors.localidad = "Ingresá la localidad."
    if (brand.length < 2) nextErrors.marca = "Ingresá la marca."
    if (line.length < 2) nextErrors.modelo = "Ingresá el modelo."
    if (!/^\d{4}$/.test(anio) || year < 1980 || year > currentYear) {
      nextErrors.anio = "Ingresá un año de 4 dígitos."
    }

    setErrors(nextErrors)
    setSubmitError("")
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      window.document.getElementById(firstError)?.scrollIntoView({ block: "center" })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/cotizaciones/automotor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patente: plate,
          cp: postalCode,
          localidad: city,
          uso,
          marca: brand,
          modelo: line,
          anio,
          gnc,
          rastreo,
          comision: gastos.comision,
          bonificacion: gastos.bonificacion,
        }),
      })
      const payload = (await response.json()) as CotizacionView & { message?: string }
      if (!response.ok) {
        setSubmitError(payload.message ?? "No se pudo cotizar en Mercantil Andina.")
        return
      }

      router.push(
        quoteHref("/cotizar/comparar", quote, {
          patente: plate,
          cp: postalCode,
          localidad: city || payload.localidadNombre,
          uso,
          marca: brand,
          modelo: line,
          anio,
          gnc,
          rastreo,
          adquisicion: gastos.adquisicion,
          descuento: gastos.descuento,
          suma: payload.sumaAsegurada ? String(Math.round(payload.sumaAsegurada)) : quote.suma,
          cotizacion: payload.id,
          compania: "mercantil",
        }),
      )
    } catch {
      setSubmitError("No se pudo conectar con el servidor de cotización.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle>Cotizá el auto</ScreenTitle>
        <TextField
          label="Patente"
          name="patente"
          value={patente}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="Ej: NSY122"
          onChange={(event) => setPatente(event.target.value.toUpperCase())}
          error={errors.patente}
        />
        <TextField
          label="Código postal"
          name="cp"
          inputMode="numeric"
          maxLength={4}
          value={cp}
          autoComplete="postal-code"
          placeholder="Ej: 1184"
          onChange={(event) => setCp(event.target.value.replace(/\D/g, "").slice(0, 4))}
          error={errors.cp}
        />
        <TextField
          label="Localidad"
          name="localidad"
          value={localidad}
          autoComplete="address-level2"
          placeholder="Ej: CABA Caballito"
          onChange={(event) => setLocalidad(event.target.value)}
          error={errors.localidad}
        />
        <SelectField
          label="Uso"
          name="uso"
          value={uso}
          onChange={(event) => {
            if (isUseId(event.target.value)) setUso(event.target.value)
          }}
        >
          {useIds.map((id) => (
            <option key={id} value={id}>
              {useLabels[id]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Marca"
          name="marca"
          value={marca}
          autoComplete="off"
          placeholder="Ej: Fiat"
          onChange={(event) => setMarca(event.target.value)}
          error={errors.marca}
        />
        <TextField
          label="Modelo"
          name="modelo"
          value={modelo}
          autoComplete="off"
          placeholder="Ej: Clio Mio 1.2"
          onChange={(event) => setModelo(event.target.value)}
          error={errors.modelo}
        />
        <TextField
          label="Año"
          name="anio"
          inputMode="numeric"
          maxLength={4}
          value={anio}
          placeholder="Ej: 2014"
          onChange={(event) => setAnio(digitsOnly(event.target.value).slice(0, 4))}
          error={errors.anio}
        />
        <Toggle label="GNC" name="gnc" checked={gnc} onCheckedChange={setGnc} />
        <Toggle label="Rastreo" name="rastreo" checked={rastreo} onCheckedChange={setRastreo} />
        <SelectField
          label="Gastos de adquisición"
          name="adquisicion"
          value={adquisicion}
          onChange={(event) => {
            if (!isAdquisicionPercent(event.target.value)) return
            setAdquisicion(event.target.value)
            if (!descuentosForAdquisicion(event.target.value).includes(descuento)) {
              setDescuento("0")
            }
          }}
        >
          {adquisicionPercents.map((id) => (
            <option key={id} value={id}>
              {adquisicionLabel(id)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Descuento"
          name="descuento"
          value={descuento}
          onChange={(event) => {
            if (isDescuentoPercent(event.target.value)) setDescuento(event.target.value)
          }}
        >
          {descuentoOpciones.map((id) => (
            <option key={id} value={id}>
              {descuentoLabel(id)}
            </option>
          ))}
        </SelectField>
        {submitError ? <p className="text-xs text-danger">{submitError}</p> : null}
        <BrandButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Cotizando…" : "Cotizar ahora"}
        </BrandButton>
      </ScreenBody>
    </form>
  )
}
