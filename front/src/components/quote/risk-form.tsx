"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SelectField, TextField } from "@/components/ui/text-field"
import { Toggle } from "@/components/ui/toggle"
import { digitsOnly, formatPesos } from "@/lib/format"
import { decodedRisk, modelLines } from "@/lib/mock-pas"
import { quoteHref, type QuoteSearch } from "@/lib/quote-search"

interface RiskFormProps {
  quote: QuoteSearch
}

interface RiskErrors {
  marca?: string
  modelo?: string
  anio?: string
  cp?: string
  suma?: string
}

export function RiskForm({ quote }: RiskFormProps) {
  const router = useRouter()
  const [isNew, setIsNew] = useState(quote.nuevo)
  const [isCommercial, setIsCommercial] = useState(quote.uso === "comercial")
  const [marca, setMarca] = useState(quote.marca || decodedRisk.brand)
  const [modelo, setModelo] = useState(quote.modelo || decodedRisk.line)
  const [anio, setAnio] = useState(quote.anio)
  const [cp, setCp] = useState(quote.cp)
  const [suma, setSuma] = useState(quote.suma)
  const [hasGnc, setHasGnc] = useState(quote.gnc)
  const [hasTracking, setHasTracking] = useState(quote.rastreo)
  const [errors, setErrors] = useState<RiskErrors>({})
  const insuredSum = Number(suma)
  const lineOptions = modelLines.includes(modelo) ? modelLines : [modelo, ...modelLines]

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: RiskErrors = {}
    const year = Number(anio)
    const currentYear = new Date().getFullYear() + 1
    const brand = marca.trim()
    const postalCode = cp.trim()

    if (!brand) nextErrors.marca = "Ingresá la marca."
    if (!modelo) nextErrors.modelo = "Elegí el modelo."

    if (!/^\d{4}$/.test(anio) || year < 1980 || year > currentYear) {
      nextErrors.anio = "Ingresá un año de 4 dígitos."
    }

    if (!/^\d{4}$/.test(postalCode)) {
      nextErrors.cp = "El código postal tiene 4 números."
    }

    if (!Number.isFinite(insuredSum) || insuredSum < 100000) {
      nextErrors.suma = "Ingresá la suma asegurada."
    }

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    router.push(
      quoteHref("/cotizar/asegurado", quote, {
        nuevo: isNew,
        uso: isCommercial ? "comercial" : "particular",
        marca: brand,
        modelo,
        anio,
        cp: postalCode,
        suma,
        gnc: hasGnc,
        rastreo: hasTracking,
      }),
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <div>
          <ScreenTitle className="text-[22px]">Vehículo decodificado</ScreenTitle>
          <p className="mt-2 text-sm font-light text-body">Patente {quote.patente}</p>
        </div>
        <TextField
          label="Marca"
          name="marca"
          value={marca}
          autoComplete="off"
          onChange={(event) => setMarca(event.target.value)}
          error={errors.marca}
        />
        <SelectField
          label="Modelo / línea"
          name="modelo"
          value={modelo}
          onChange={(event) => setModelo(event.target.value)}
          error={errors.modelo}
        >
          {lineOptions.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Año"
          name="anio"
          inputMode="numeric"
          maxLength={4}
          value={anio}
          onChange={(event) => setAnio(digitsOnly(event.target.value).slice(0, 4))}
          error={errors.anio}
        />
        <TextField
          label="CP"
          name="cp"
          inputMode="numeric"
          maxLength={4}
          value={cp}
          autoComplete="postal-code"
          onChange={(event) => setCp(digitsOnly(event.target.value).slice(0, 4))}
          error={errors.cp}
        />
        <Toggle label="GNC" name="gnc" checked={hasGnc} onCheckedChange={setHasGnc} />
        <Toggle
          label="Rastreo"
          name="rastreo"
          checked={hasTracking}
          onCheckedChange={setHasTracking}
        />
        <Toggle label="Nuevo" name="nuevo" checked={isNew} onCheckedChange={setIsNew} />
        <Toggle
          label="Comercial"
          name="comercial"
          checked={isCommercial}
          onCheckedChange={setIsCommercial}
        />
        <TextField
          label="Suma asegurada"
          name="suma"
          inputMode="numeric"
          value={suma ? formatPesos(Number(suma)) : ""}
          onChange={(event) => setSuma(digitsOnly(event.target.value).slice(0, 12))}
          error={errors.suma}
        />
        <BrandButton type="submit">Consultar compañías</BrandButton>
      </ScreenBody>
    </form>
  )
}
