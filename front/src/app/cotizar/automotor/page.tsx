import { QuoteForm } from "@/components/quote/quote-form"
import { loadQuote } from "@/lib/quote-search"

export default async function CotizarAutomotorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)

  return <QuoteForm quote={quote} />
}
