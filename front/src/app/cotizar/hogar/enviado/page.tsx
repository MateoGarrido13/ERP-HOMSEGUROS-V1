import { ShareNotice } from "@/components/collections/share-notice"
import { AseguradoSummary } from "@/components/quote/asegurado-summary"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { loadAsegurado } from "@/lib/asegurado-search"
import { formatPesos } from "@/lib/format"
import {
  loadHogar,
  mascotaLabels,
  viviendaTipoLabels,
  viviendaUsoLabels,
} from "@/lib/hogar-search"
import { producer } from "@/lib/mock-pas"
import { decodeObjetos, objetoResumen } from "@/lib/objetos-particulares"
import { quoteWhatsappLabel, quoteWhatsappMessage } from "@/lib/quote-share"

export default async function HogarEnviadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const [hogar, asegurado] = await Promise.all([loadHogar(params), loadAsegurado(params)])
  const contentSum = Number(hogar.contenido)
  const objetos = decodeObjetos(hogar.objetos)
  const hasSummary = Boolean(hogar.uso && hogar.vivienda && hogar.mascotas)

  return (
    <ScreenBody>
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full bg-accent text-2xl font-semibold text-white"
      >
        ✓
      </span>
      <ScreenTitle>Propuesta generada</ScreenTitle>
      {hasSummary && hogar.uso && hogar.vivienda && hogar.mascotas ? (
        <SurfaceCard tone="mint">
          <p className="text-[11px] font-medium tracking-wide text-teal-deep">
            HOGAR · {producer.name}
          </p>
          <p className="mt-2 text-[19px] leading-tight font-medium text-ink">
            {viviendaTipoLabels[hogar.vivienda]}
          </p>
          <p className="mt-2 text-sm font-light text-body">{viviendaUsoLabels[hogar.uso]}</p>
          <p className="mt-1 text-sm font-light text-body">
            CP {hogar.cp} · {hogar.metros} m² · contenido{" "}
            {Number.isFinite(contentSum) ? formatPesos(contentSum) : "—"}
          </p>
          <p className="mt-1 text-sm font-light text-body">
            Mascotas:{" "}
            {hogar.mascotas === "si"
              ? hogar.mascotaDetalle
              : mascotaLabels[hogar.mascotas]}
          </p>
          {objetos.length > 0 ? (
            <div className="mt-2">
              <p className="text-sm font-light text-body">Objetos particulares</p>
              <ul className="mt-1 flex flex-col gap-1">
                {objetos.map((item) => (
                  <li key={item.id} className="text-sm font-light text-body">
                    {objetoResumen(item)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <AseguradoSummary asegurado={asegurado} />
        </SurfaceCard>
      ) : (
        <SurfaceCard tone="mint">
          <p className="text-sm font-light text-body">
            La solicitud de cotización de hogar quedó registrada.
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
