"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { StatusPill } from "@/components/ui/status-pill"
import { SurfaceCard } from "@/components/ui/surface-card"
import { formatPesos } from "@/lib/format"
import { offers } from "@/lib/mock-pas"
import { quoteHref, type QuoteSearch } from "@/lib/quote-search"
import { cn } from "@/lib/cn"

interface CompareBoardProps {
  quote: QuoteSearch
}

export function CompareBoard({ quote }: CompareBoardProps) {
  const [isMercantilReady, setIsMercantilReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMercantilReady(true), 1600)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Comparar primas</ScreenTitle>
      {offers.map((offer) => {
        const isWaiting = offer.id === "mercantil" && !isMercantilReady
        const card = (
          <SurfaceCard className={cn(isWaiting ? "" : "transition-colors hover:border-primary")}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-medium text-ink">{offer.name}</p>
              <StatusPill tone={isWaiting ? "cargando" : "listo"}>
                {isWaiting ? "CARGANDO" : "LISTO"}
              </StatusPill>
            </div>
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

        if (isWaiting) {
          return (
            <div key={offer.id} aria-busy="true">
              {card}
            </div>
          )
        }

        return (
          <Link
            key={offer.id}
            href={quoteHref("/cotizar/propuesta", quote, { compania: offer.id })}
            className="block text-left"
          >
            {card}
          </Link>
        )
      })}
    </ScreenBody>
  )
}
