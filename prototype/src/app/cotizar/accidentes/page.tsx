import { AccidentesForm } from "@/components/quote/accidentes-form"
import { loadAccidentes } from "@/lib/accidentes-search"

export default async function CotizarAccidentesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const accidentes = await loadAccidentes(searchParams)

  return <AccidentesForm accidentes={accidentes} />
}
