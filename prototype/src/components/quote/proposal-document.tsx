import { SignedLicense, SignedName } from "@/components/auth/signed-identity"
import { BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { formatPesos } from "@/lib/format"
import { decodedRisk, holder, offerSelection } from "@/lib/mock-pas"
import { quoteHref, type QuoteSearch } from "@/lib/quote-search"

interface ProposalDocumentProps {
  quote: QuoteSearch
}

export function ProposalDocument({ quote }: ProposalDocumentProps) {
  const { featured: offer, alternatives } = offerSelection(quote.compania, quote.alternativas)
  const vehicle = [quote.marca || decodedRisk.brand, quote.modelo || decodedRisk.line, quote.anio]
    .filter(Boolean)
    .join(" ")
  const rows = [
    { label: "Prima comercial", amount: offer.premium },
    { label: "Recargos", amount: offer.surcharges },
    { label: "Impuestos", amount: offer.taxes },
  ]

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle size="document">Propuesta HOM</ScreenTitle>
      <SurfaceCard>
        <p className="text-[11px] font-normal tracking-wide text-muted">
          HOM PROFESIONALES EN SEGUROS
        </p>
        <p className="mt-2 text-base font-semibold text-ink">Propuesta automotor</p>
        <p className="mt-2 text-[13px] font-light text-body">
          Tomador: {holder.name} · {quote.patente} · {vehicle}
        </p>
        <p className="mt-1 text-[13px] font-light text-body">
          Productor: <SignedName /> — matrícula <SignedLicense />
        </p>
        <hr className="my-3 border-line" />
        <p className="text-[11px] font-medium tracking-wide text-teal-deep">OPCIÓN DESTACADA</p>
        <p className="mt-1 text-[13px] font-medium text-ink">
          {offer.name} · {offer.coverage}
        </p>
        <dl className="mt-2 flex flex-col gap-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 text-[13px] font-light text-body">
              <dt>{row.label}</dt>
              <dd>{formatPesos(row.amount)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <p className="text-lg font-bold text-ink">Total</p>
          <p className="text-lg font-bold text-ink">{formatPesos(offer.monthly)}</p>
        </div>
      </SurfaceCard>
      {alternatives.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-medium text-teal-deep">Alternativas</h2>
          {alternatives.map((alternative) => (
            <SurfaceCard key={alternative.id}>
              <p className="text-base font-medium text-ink">
                {alternative.name} · {alternative.coverage}
              </p>
              <p className="mt-1 font-sans text-[22px] font-semibold tracking-tight text-title">
                {formatPesos(alternative.monthly)}
              </p>
            </SurfaceCard>
          ))}
        </section>
      ) : null}
      <BrandButtonLink href={quoteHref("/cotizar/enviado", quote)} variant="whatsapp">
        Enviar a {holder.name}
      </BrandButtonLink>
    </ScreenBody>
  )
}
