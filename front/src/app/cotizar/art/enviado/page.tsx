import { SignedName } from "@/components/auth/signed-identity"
import { ShareNotice } from "@/components/collections/share-notice"
import { AseguradoSummary } from "@/components/quote/asegurado-summary"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { loadAsegurado } from "@/lib/asegurado-search"
import { formatCuit, loadArt } from "@/lib/art-search"
import { formatPesos } from "@/lib/format"
import { quoteWhatsappLabel, quoteWhatsappMessage } from "@/lib/quote-share"

export default async function ArtEnviadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [art, asegurado] = await Promise.all([loadArt(params), loadAsegurado(params)])
  const payroll = Number(art.masa)
  const headcount = Number(art.empleados)
  const hasSummary = Boolean(art.empresa && art.cuit && art.actividad && art.cargo)

  return (
    <ScreenBody>
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full bg-accent text-2xl font-semibold text-white"
      >
        ✓
      </span>
      <ScreenTitle>Propuesta generada</ScreenTitle>
      {hasSummary ? (
        <SurfaceCard tone="mint">
          <p className="text-[11px] font-medium tracking-wide text-teal-deep">
            ART · <SignedName />
          </p>
          <p className="mt-2 text-[19px] leading-tight font-medium text-ink">{art.empresa}</p>
          <p className="mt-2 text-sm font-light text-body">CUIT {formatCuit(art.cuit)}</p>
          <p className="mt-1 text-sm font-light text-body">{art.actividad}</p>
          <p className="mt-1 text-sm font-light text-body">
            {headcount === 1 ? "1 empleado" : `${art.empleados} empleados`}
            {Number.isFinite(payroll) && payroll >= 1 ? ` · ${formatPesos(payroll)}` : ""}
          </p>
          <p className="mt-1 text-sm font-light text-body">Cargo: {art.cargo}</p>
          {art.archivo ? (
            <p className="mt-1 text-sm font-light text-body">Formulario 931: {art.archivo}</p>
          ) : null}
          <AseguradoSummary asegurado={asegurado} />
        </SurfaceCard>
      ) : (
        <SurfaceCard tone="mint">
          <p className="text-sm font-light text-body">
            La solicitud de cotización de ART quedó registrada.
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
