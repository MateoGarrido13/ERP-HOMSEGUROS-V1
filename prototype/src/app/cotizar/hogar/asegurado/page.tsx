import { AseguradoOrigen } from "@/components/quote/asegurado-origen"
import { loadAsegurado } from "@/lib/asegurado-search"
import { hogarHref, loadHogar } from "@/lib/hogar-search"

export default async function HogarAseguradoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [hogar, asegurado] = await Promise.all([loadHogar(params), loadAsegurado(params)])

  return (
    <AseguradoOrigen
      asegurado={asegurado}
      continueHref={hogarHref("/cotizar/hogar/enviado", hogar)}
    />
  )
}
