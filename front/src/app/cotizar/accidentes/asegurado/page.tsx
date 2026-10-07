import { AseguradoForm } from "@/components/quote/asegurado-form"
import { accidentesHref, loadAccidentes } from "@/lib/accidentes-search"
import { loadAsegurado } from "@/lib/asegurado-search"

export default async function AccidentesAseguradoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [accidentes, asegurado] = await Promise.all([
    loadAccidentes(params),
    loadAsegurado(params),
  ])

  return (
    <AseguradoForm
      asegurado={asegurado}
      continueHref={accidentesHref("/cotizar/accidentes/enviado", accidentes)}
    />
  )
}
