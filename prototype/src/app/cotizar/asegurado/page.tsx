import { AseguradoOrigen } from "@/components/quote/asegurado-origen"
import { loadAsegurado } from "@/lib/asegurado-search"
import { loadQuote, quoteHref } from "@/lib/quote-search"

export default async function AseguradoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [quote, asegurado] = await Promise.all([loadQuote(params), loadAsegurado(params)])

  return (
    <AseguradoOrigen asegurado={asegurado} continueHref={quoteHref("/cotizar/comparar", quote)} />
  )
}
