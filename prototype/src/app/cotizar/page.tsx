import { CoveragePicker } from "@/components/quote/coverage-picker"
import { loadQuote, quoteHref } from "@/lib/quote-search"

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)

  return (
    <CoveragePicker
      automotorHref={quoteHref("/cotizar/automotor", quote, { cotizacion: "" })}
      hogarHref="/cotizar/hogar"
      accidentesHref="/cotizar/accidentes"
      artHref="/cotizar/art"
    />
  )
}
