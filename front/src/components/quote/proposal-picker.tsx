import Link from "next/link"

import { BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { formatPesos } from "@/lib/format"
import { offers } from "@/lib/mock-pas"
import { cn } from "@/lib/cn"
import { quoteHref, type QuoteSearch } from "@/lib/quote-search"

interface ProposalPickerProps {
  quote: QuoteSearch
}

export function ProposalPicker({ quote }: ProposalPickerProps) {
  const visibleOffers = offers.filter(
    (offer) => offer.id !== "mercantil" || quote.compania === "mercantil",
  )

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Elegí y enviá</ScreenTitle>
      {visibleOffers.map((offer) => {
        const isSelected = offer.id === quote.compania

        return (
          <Link
            key={offer.id}
            href={quoteHref("/cotizar/propuesta", quote, { compania: offer.id })}
            aria-current={isSelected ? "true" : undefined}
            className="block text-left"
          >
            <SurfaceCard
              tone={offer.isRecommended ? "mint" : "plain"}
              className={cn(isSelected && "outline outline-2 outline-primary")}
            >
              {offer.isRecommended ? (
                <p className="text-[11px] font-medium tracking-wide text-teal-deep">
                  MEJOR RELACIÓN
                </p>
              ) : null}
              <p className={cn("text-base font-medium text-ink", offer.isRecommended && "mt-1")}>
                {offer.name} · {offer.coverage}
              </p>
              <p
                className={cn(
                  "mt-1 font-display font-bold text-ink",
                  offer.isRecommended ? "text-[26px]" : "text-[22px]",
                )}
              >
                {formatPesos(offer.monthly)}
              </p>
              {offer.isRecommended ? (
                <p className="mt-2 text-xs font-light text-muted">
                  Prima {formatPesos(offer.premium).replace("$ ", "")} + recargos{" "}
                  {formatPesos(offer.surcharges).replace("$ ", "")} + impuestos{" "}
                  {formatPesos(offer.taxes).replace("$ ", "")}
                </p>
              ) : null}
            </SurfaceCard>
          </Link>
        )
      })}
      <BrandButtonLink
        href={quoteHref("/cotizar/pdf", quote)}
        variant="whatsapp"
      >
        Generar PDF y enviar por WhatsApp
      </BrandButtonLink>
    </ScreenBody>
  )
}
