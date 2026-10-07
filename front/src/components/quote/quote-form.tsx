"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SelectField, TextField } from "@/components/ui/text-field"
import {
  quoteHref,
  useIds,
  useLabels,
  type QuoteSearch,
  type UseId,
} from "@/lib/quote-search"

interface QuoteFormProps {
  quote: QuoteSearch
}

interface QuoteErrors {
  patente?: string
  cp?: string
}

function isUseId(value: string): value is UseId {
  return useIds.some((id) => id === value)
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const router = useRouter()
  const [patente, setPatente] = useState(quote.patente)
  const [cp, setCp] = useState(quote.cp)
  const [uso, setUso] = useState<UseId>(quote.uso)
  const [errors, setErrors] = useState<QuoteErrors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: QuoteErrors = {}
    const plate = patente.trim().toUpperCase()
    const postalCode = cp.trim()

    if (!/^[A-Z0-9]{2,3}\s?[0-9]{3}\s?[A-Z]{0,3}$/.test(plate.replace(/\s+/g, " "))) {
      nextErrors.patente = "Ingresá la patente, por ejemplo AB 123 CD."
    }

    if (!/^\d{4}$/.test(postalCode)) {
      nextErrors.cp = "El código postal tiene 4 números."
    }

    setErrors(nextErrors)
    if (nextErrors.patente || nextErrors.cp) return

    router.push(
      quoteHref("/cotizar/riesgo", quote, {
        patente: plate,
        cp: postalCode,
        uso,
      }),
    )
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
          onChange={(event) => setCp(event.target.value.replace(/\D/g, "").slice(0, 4))}
          error={errors.cp}
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
        <BrandButton type="submit">Cotizar ahora</BrandButton>
      </ScreenBody>
    </form>
  )
}
