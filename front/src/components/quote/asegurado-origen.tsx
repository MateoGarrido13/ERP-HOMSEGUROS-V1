"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { AseguradoForm } from "@/components/quote/asegurado-form"
import { ChoiceField } from "@/components/ui/choice-field"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { withAsegurado, type AseguradoSearch } from "@/lib/asegurado-search"
import {
  groupClients,
  localityLabels,
  portfolioPolicies,
  ramoLabels,
  type PortfolioClient,
} from "@/lib/portfolio"

interface AseguradoOrigenProps {
  asegurado: AseguradoSearch
  continueHref: string
}

type OrigenId = "nuevo" | "existente"

const origenOptions = [
  { id: "nuevo", label: "Nuevo cliente" },
  { id: "existente", label: "Cliente existente" },
]

function isOrigenId(value: string): value is OrigenId {
  return value === "nuevo" || value === "existente"
}

function aseguradoFromClient(holder: string): AseguradoSearch {
  const [nombre, ...rest] = holder.trim().split(/\s+/)

  return {
    nombre: nombre ?? "",
    apellido: rest.join(" "),
    email: "",
    telefono: "",
    dni: "",
    comentarios: "",
  }
}

function clientDetail(client: PortfolioClient) {
  const policy = client.policies[0]
  if (!policy || client.policies.length > 1) return `${client.policies.length} pólizas`
  return `${ramoLabels[policy.ramo]} · ${localityLabels[policy.locality]}`
}

export function AseguradoOrigen({ asegurado, continueHref }: AseguradoOrigenProps) {
  const router = useRouter()
  const [origen, setOrigen] = useState<OrigenId | null>(null)
  const clients = groupClients(portfolioPolicies)

  function selectClient(holder: string) {
    router.push(withAsegurado(continueHref, aseguradoFromClient(holder)))
  }

  if (origen === "nuevo") {
    return (
      <div className="flex flex-1 flex-col">
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={() => setOrigen(null)}
            className="text-sm font-medium text-teal-deep"
          >
            Volver
          </button>
        </div>
        <AseguradoForm asegurado={asegurado} continueHref={continueHref} />
      </div>
    )
  }

  return (
    <ScreenBody>
      <ScreenTitle>Datos del asegurado</ScreenTitle>
      <ChoiceField
        label="¿A quién querés asegurar?"
        name="origen"
        value={origen}
        options={origenOptions}
        onChange={(value) => {
          if (isOrigenId(value)) setOrigen(value)
        }}
      />
      {origen === "existente" ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-medium text-teal-deep">Elegí el cliente</h2>
          {clients.map((client) => (
            <SurfaceCard key={client.id} onClick={() => selectClient(client.holder)}>
              <p className="text-base font-medium text-ink">{client.holder}</p>
              <p className="mt-1 text-[13px] font-light text-body">{clientDetail(client)}</p>
            </SurfaceCard>
          ))}
        </section>
      ) : null}
    </ScreenBody>
  )
}
