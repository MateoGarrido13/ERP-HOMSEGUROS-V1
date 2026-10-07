import { CompareBoard } from "@/components/quote/compare-board"
import { loadQuote } from "@/lib/quote-search"

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)

  return <CompareBoard quote={quote} />
}
