import { ProposalDocument } from "@/components/quote/proposal-document"
import { loadQuote } from "@/lib/quote-search"

export default async function PdfPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)

  return <ProposalDocument quote={quote} />
}
