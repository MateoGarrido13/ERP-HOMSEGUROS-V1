"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { StatusPill } from "@/components/ui/status-pill"
import { SurfaceCard } from "@/components/ui/surface-card"
import { formatPesos } from "@/lib/format"
import { offers, pickFeatured } from "@/lib/mock-pas"
import { quoteHref, type CompanyId, type QuoteSearch } from "@/lib/quote-search"
import { cn } from "@/lib/cn"
import type { CotizacionPlanView, CotizacionView } from "@/services/mercantil/types"

interface CompareBoardProps {
  quote: QuoteSearch
  mercantil?: CotizacionView | null
}

function mercantilMonthly(mercantil: CotizacionView) {
  const preferred =
    mercantil.planes.find((plan) => plan.producto === "M BASICA") ??
    mercantil.planes.find((plan) => plan.costo > 0)
  return preferred?.costo ?? 0
}

function MercantilPlanList({ planes }: { planes: CotizacionPlanView[] }) {
  if (planes.length === 0) return null

  return (
    <ul className="mt-3 flex flex-col gap-1.5">
      {planes.map((plan) => (
        <li
          key={plan.numero}
          className="flex items-start justify-between gap-3 text-xs leading-4 text-body"
        >
          <span className="font-light">{plan.texto || plan.producto}</span>
          <span className="shrink-0 font-medium text-title">{formatPesos(plan.costo)}</span>
        </li>
      ))}
    </ul>
  )
}

export function CompareBoard({ quote, mercantil = null }: CompareBoardProps) {
  const router = useRouter()
  const hasLiveMercantil = Boolean(mercantil?.planes.length)
  const [isMercantilReady, setIsMercantilReady] = useState(hasLiveMercantil)
  const [selected, setSelected] = useState<CompanyId[]>(hasLiveMercantil ? ["mercantil"] : ["sancor"])
  const featured = pickFeatured(selected)

  useEffect(() => {
    if (hasLiveMercantil) return
    const timer = window.setTimeout(() => setIsMercantilReady(true), 1600)
    return () => window.clearTimeout(timer)
  }, [hasLiveMercantil])

  function toggle(id: CompanyId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function continueToProposal() {
    if (!featured) return

    router.push(
      quoteHref("/cotizar/propuesta", quote, {
        compania: featured.id,
        alternativas: selected.filter((id) => id !== featured.id),
      }),
    )
  }

  return (
    <ScreenBody className="gap-2.5">
      <div>
        <ScreenTitle className="text-[22px]">Comparar primas</ScreenTitle>
        <p className="mt-2 text-sm font-light text-body">
          Marcá una o más compañías. La primera opción queda destacada y el resto se ofrece como
          alternativa.
        </p>
      </div>
      {offers.map((offer) => {
        const isWaiting = offer.id === "mercantil" && !isMercantilReady
        const isSelected = selected.includes(offer.id)
        const isFeatured = featured?.id === offer.id
        const card = (
          <SurfaceCard
            tone={isFeatured ? "mint" : "plain"}
            onClick={isWaiting ? undefined : () => toggle(offer.id)}
            className={cn(isSelected && "outline outline-2 outline-primary")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-medium text-ink">{offer.name}</p>
              <StatusPill tone={isWaiting ? "cargando" : "listo"}>
                {isWaiting ? "CARGANDO" : "LISTO"}
              </StatusPill>
            </div>
            {isFeatured ? (
              <p className="mt-2 text-[11px] font-medium tracking-wide text-teal-deep">
                OPCIÓN DESTACADA
              </p>
            ) : null}
            {isSelected && !isFeatured ? (
              <p className="mt-2 text-[11px] font-medium tracking-wide text-teal-deep">
                ALTERNATIVA
              </p>
            ) : null}
            <p className="mt-2 font-sans text-2xl leading-none font-semibold tracking-tight text-title">
              {isWaiting
                ? "—"
                : `${formatPesos(offer.id === "mercantil" && mercantil ? mercantilMonthly(mercantil) : offer.monthly)} / mes`}
            </p>
            <p className="mt-2 text-xs font-light text-muted">
              {isWaiting
                ? "Esperando al middleware…"
                : offer.id === "mercantil" && mercantil
                  ? `${mercantil.vehiculoNombre} · ${mercantil.localidadNombre}`
                  : "Prima comercial + recargos + impuestos"}
            </p>
            {offer.id === "mercantil" && mercantil ? (
              <MercantilPlanList planes={mercantil.planes} />
            ) : null}
          </SurfaceCard>
        )

        return (
          <div key={offer.id} aria-busy={isWaiting || undefined}>
            {card}
          </div>
        )
      })}
      <BrandButton type="button" disabled={!featured} onClick={continueToProposal}>
        Armar propuesta
      </BrandButton>
    </ScreenBody>
  )
}
