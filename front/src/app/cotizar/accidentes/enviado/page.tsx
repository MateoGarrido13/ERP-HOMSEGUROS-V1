import { ShareNotice } from "@/components/collections/share-notice"
import { AseguradoSummary } from "@/components/quote/asegurado-summary"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { loadAsegurado } from "@/lib/asegurado-search"
import {
  documentoLabels,
  loadAccidentes,
  personasLabels,
} from "@/lib/accidentes-search"
import { formatPesos } from "@/lib/format"
import { producer } from "@/lib/mock-pas"
import { quoteWhatsappLabel, quoteWhatsappMessage } from "@/lib/quote-share"

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-")
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

export default async function AccidentesEnviadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [accidentes, asegurado] = await Promise.all([
    loadAccidentes(params),
    loadAsegurado(params),
  ])
  const insuredSum = Number(accidentes.suma)
  const hasSummary = Boolean(
    accidentes.actividad && accidentes.personas && accidentes.documento,
  )

  return (
    <ScreenBody>
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full bg-accent text-2xl font-semibold text-white"
      >
        ✓
      </span>
      <ScreenTitle>Propuesta generada</ScreenTitle>
      {hasSummary && accidentes.personas && accidentes.documento ? (
        <SurfaceCard tone="mint">
          <p className="text-[11px] font-medium tracking-wide text-teal-deep">
            ACCIDENTES · {producer.name}
          </p>
          <p className="mt-2 text-[19px] leading-tight font-medium text-ink">
            {accidentes.actividad}
          </p>
          <p className="mt-2 text-sm font-light text-body">
            {formatDate(accidentes.inicio)} – {formatDate(accidentes.fin)}
          </p>
          <p className="mt-1 text-sm font-light text-body">
            {personasLabels[accidentes.personas]}
            {insuredSum >= 1000 ? ` · ${formatPesos(insuredSum)}` : ""}
          </p>
          <p className="mt-1 text-sm font-light text-body">
            {documentoLabels[accidentes.documento]} {accidentes.numero} · nac.{" "}
            {formatDate(accidentes.nacimiento)}
          </p>
          <AseguradoSummary asegurado={asegurado} />
        </SurfaceCard>
      ) : (
        <SurfaceCard tone="mint">
          <p className="text-sm font-light text-body">
            La solicitud de cotización de accidentes personales quedó registrada.
          </p>
        </SurfaceCard>
      )}
      <ShareNotice
        actionLabel={quoteWhatsappLabel}
        message={quoteWhatsappMessage(asegurado.nombre)}
      />
    </ScreenBody>
  )
}
