import { ArtForm } from "@/components/quote/art-form"
import { loadArt } from "@/lib/art-search"

export default async function CotizarArtPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const art = await loadArt(searchParams)

  return <ArtForm art={art} />
}
