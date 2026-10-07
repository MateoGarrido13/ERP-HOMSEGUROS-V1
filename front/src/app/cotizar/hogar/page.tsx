import { HogarForm } from "@/components/quote/hogar-form"
import { loadHogar } from "@/lib/hogar-search"

export default async function CotizarHogarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const hogar = await loadHogar(searchParams)

  return <HogarForm hogar={hogar} />
}
