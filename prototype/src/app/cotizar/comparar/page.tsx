import { CompareBoard } from "@/components/quote/compare-board"
import { loadQuote } from "@/lib/quote-search"
import { loadMercantilForConsulta } from "@/services/mercantil/cotizar-auto.service"

export const dynamic = "force-dynamic"

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const quote = await loadQuote(searchParams)
  const mercantil = await loadMercantilForConsulta({
    cotizacion: quote.cotizacion,
    patente: quote.patente,
    marca: quote.marca,
    modelo: quote.modelo,
    anio: quote.anio,
  })

  return <CompareBoard key={mercantil?.id ?? "sin-cotizacion"} quote={quote} mercantil={mercantil} />
}
