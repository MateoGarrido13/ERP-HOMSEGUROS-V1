import { SurfaceCard } from "@/components/ui/surface-card"
import type { RamoShare } from "@/lib/portfolio"

interface RamoChartProps {
  shares: RamoShare[]
  total: number
}

export function RamoChart({ shares, total }: RamoChartProps) {
  const summary = shares
    .map((share) => `${share.label} ${share.percent}%`)
    .join(", ")

  return (
    <SurfaceCard>
      <p className="text-[11px] font-medium tracking-wide text-muted">POR RAMO</p>
      <div className="mt-3 flex flex-col items-center gap-4">
        <div className="relative size-40">
          <svg viewBox="0 0 160 160" className="size-full" role="img" aria-label={`Cartera por ramo: ${summary}.`}>
            {wedges(shares).map((slice) => (
              <path key={slice.id} d={slice.path} fill={slice.color} />
            ))}
            <circle cx="80" cy="80" r="46" className="fill-white" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold text-ink">{total}</span>
            <span className="text-[11px] font-light text-muted">pólizas</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-2">
          {shares.map((share) => (
            <li key={share.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-body">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: share.color }}
                />
                {share.label}
              </span>
              <span className="shrink-0 font-medium text-ink">
                {share.count} · {share.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SurfaceCard>
  )
}

function wedges(shares: RamoShare[]) {
  const total = shares.reduce((sum, share) => sum + share.count, 0)
  let cursor = 0

  return shares.map((share) => {
    const start = cursor
    const span = total === 0 ? 0 : (share.count / total) * 360
    cursor += span

    return {
      id: share.id,
      color: share.color,
      path: wedgePath(80, 80, 72, start, start + span),
    }
  })
}

function wedgePath(cx: number, cy: number, radius: number, start: number, end: number) {
  const span = end - start
  if (span >= 359.99) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
  }

  const startPoint = polar(cx, cy, radius, start)
  const endPoint = polar(cx, cy, radius, end)
  const largeArc = span > 180 ? 1 : 0

  return `M ${cx} ${cy} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y} Z`
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180

  return {
    x: round(cx + radius * Math.cos(radians)),
    y: round(cy + radius * Math.sin(radians)),
  }
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
