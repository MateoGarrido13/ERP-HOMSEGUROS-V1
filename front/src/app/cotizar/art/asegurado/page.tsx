import { AseguradoOrigen } from "@/components/quote/asegurado-origen"
import { artHref, loadArt } from "@/lib/art-search"
import { loadAsegurado } from "@/lib/asegurado-search"

export default async function ArtAseguradoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [art, asegurado] = await Promise.all([loadArt(params), loadAsegurado(params)])

  return (
    <AseguradoOrigen asegurado={asegurado} continueHref={artHref("/cotizar/art/enviado", art)} />
  )
}
