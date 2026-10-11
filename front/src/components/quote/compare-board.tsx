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

interface CompareBoardProps {
  quote: QuoteSearch
}

export function CompareBoard({ quote }: CompareBoardProps) {
  const router = useRouter()
  const [isMercantilReady, setIsMercantilReady] = useState(false)
  const [selected, setSelected] = useState<CompanyId[]>(["sancor"])
  const featured = pickFeatured(selected)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMercantilReady(true), 1600)
    return () => window.clearTimeout(timer)
  }, [])

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
            <p className="mt-2 font-display text-2xl leading-none font-bold text-ink">
              {isWaiting ? "—" : `${formatPesos(offer.monthly)} / mes`}
            </p>
            <p className="mt-2 text-xs font-light text-muted">
              {isWaiting
                ? "Esperando al middleware…"
                : "Prima comercial + recargos + impuestos"}
            </p>
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
