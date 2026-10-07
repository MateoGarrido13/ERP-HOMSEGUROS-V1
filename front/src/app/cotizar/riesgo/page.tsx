import { RiskForm } from "@/components/quote/risk-form"
import { loadQuote } from "@/lib/quote-search"

export default async function RiesgoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)

  return <RiskForm quote={quote} />
}
