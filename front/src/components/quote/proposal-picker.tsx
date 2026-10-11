import { BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { formatPesos } from "@/lib/format"
import { offerSelection } from "@/lib/mock-pas"
import { quoteHref, type QuoteSearch } from "@/lib/quote-search"

interface ProposalPickerProps {
  quote: QuoteSearch
}

export function ProposalPicker({ quote }: ProposalPickerProps) {
  const { featured, alternatives } = offerSelection(quote.compania, quote.alternativas)

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Propuesta para el cliente</ScreenTitle>
      <SurfaceCard tone="mint">
        <p className="text-[11px] font-medium tracking-wide text-teal-deep">OPCIÓN DESTACADA</p>
        <p className="mt-1 text-base font-medium text-ink">
          {featured.name} · {featured.coverage}
        </p>
        <p className="mt-1 font-display text-[26px] font-bold text-ink">
          {formatPesos(featured.monthly)}
        </p>
        <p className="mt-2 text-xs font-light text-muted">
          Prima {formatPesos(featured.premium).replace("$ ", "")} + recargos{" "}
          {formatPesos(featured.surcharges).replace("$ ", "")} + impuestos{" "}
          {formatPesos(featured.taxes).replace("$ ", "")}
        </p>
      </SurfaceCard>
      {alternatives.map((offer) => (
        <SurfaceCard key={offer.id}>
          <p className="text-[11px] font-medium tracking-wide text-teal-deep">ALTERNATIVA</p>
          <p className="mt-1 text-base font-medium text-ink">
            {offer.name} · {offer.coverage}
          </p>
          <p className="mt-1 font-display text-[22px] font-bold text-ink">
            {formatPesos(offer.monthly)}
          </p>
        </SurfaceCard>
      ))}
      <BrandButtonLink href={quoteHref("/cotizar/pdf", quote)} variant="whatsapp">
        Generar PDF y enviar por WhatsApp
      </BrandButtonLink>
    </ScreenBody>
  )
}
