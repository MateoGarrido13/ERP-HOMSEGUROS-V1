import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { producer } from "@/lib/mock-pas"

const profileRows = [
  { label: "Rol", value: "Productor asesor de seguros" },
  { label: "Matrícula", value: producer.license },
  { label: "Organización", value: "HOM Profesionales en Seguros" },
]

export default function PerfilPage() {
  return (
    <ScreenBody>
      <ScreenTitle className="text-[22px]">{producer.name}</ScreenTitle>
      <SurfaceCard>
        <dl className="flex flex-col gap-3">
          {profileRows.map((row) => (
            <div key={row.label}>
              <dt className="text-[11px] font-medium tracking-wide text-muted">
                {row.label.toUpperCase()}
              </dt>
              <dd className="mt-1 text-sm font-light text-body">{row.value}</dd>
            </div>
          ))}
        </dl>
      </SurfaceCard>
    </ScreenBody>
  )
}
