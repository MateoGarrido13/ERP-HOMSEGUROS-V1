import { ProposalPicker } from "@/components/quote/proposal-picker"
import { loadQuote } from "@/lib/quote-search"

export default async function PropuestaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)

  return <ProposalPicker quote={quote} />
}
