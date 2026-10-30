import { SignedName } from "@/components/auth/signed-identity"
import { BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { formatPesos } from "@/lib/format"
import { offerSelection, proposalTrace } from "@/lib/mock-pas"
import { loadQuote } from "@/lib/quote-search"

export default async function EnviadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)
  const { featured: offer, alternatives } = offerSelection(quote.compania, quote.alternativas)

  return (
    <ScreenBody>
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full bg-accent text-2xl font-semibold text-white"
      >
        ✓
      </span>
      <ScreenTitle>Propuesta enviada</ScreenTitle>
      <SurfaceCard tone="mint">
        <p className="text-[11px] font-medium tracking-wide text-teal-deep">
          {proposalTrace.code}
        </p>
        <p className="mt-2 text-sm font-light text-body">
          <SignedName /> · {proposalTrace.when}
        </p>
        <p className="mt-1 text-sm font-light text-body">
          {offer.name} {formatPesos(offer.monthly)} · {proposalTrace.version}
        </p>
        {alternatives.length > 0 ? (
          <p className="mt-1 text-sm font-light text-body">
            Alternativas: {alternatives.map((alternative) => alternative.name).join(", ")}
          </p>
        ) : null}
      </SurfaceCard>
      <BrandButtonLink href="/cartera" variant="whatsapp">
        Ver cartera
      </BrandButtonLink>
    </ScreenBody>
  )
}
