/** Combos de Mercantil: gastos de adquisición + descuento opcional. */
export const adquisicionPercents = ["10", "20", "25", "30"] as const
export const descuentoPercents = ["0", "5", "10", "15", "20"] as const

export type AdquisicionPercent = (typeof adquisicionPercents)[number]
export type DescuentoPercent = (typeof descuentoPercents)[number]

export interface GastosAdquisicion {
  adquisicion: AdquisicionPercent
  descuento: DescuentoPercent
  comision: number
  bonificacion: number
  label: string
}

function labelFor(adquisicion: AdquisicionPercent, descuento: DescuentoPercent) {
  const base = `${adquisicion}% adquisición`
  return descuento === "0" ? base : `${base} (descuento ${descuento}%)`
}

export const gastosAdquisicion: GastosAdquisicion[] = [
  { adquisicion: "10", descuento: "0", comision: 10, bonificacion: 0, label: labelFor("10", "0") },
  { adquisicion: "10", descuento: "5", comision: 10, bonificacion: 5, label: labelFor("10", "5") },
  { adquisicion: "10", descuento: "10", comision: 10, bonificacion: 10, label: labelFor("10", "10") },
  { adquisicion: "10", descuento: "15", comision: 10, bonificacion: 15, label: labelFor("10", "15") },
  { adquisicion: "10", descuento: "20", comision: 10, bonificacion: 20, label: labelFor("10", "20") },
  { adquisicion: "20", descuento: "0", comision: 20, bonificacion: 0, label: labelFor("20", "0") },
  { adquisicion: "20", descuento: "5", comision: 20, bonificacion: 5, label: labelFor("20", "5") },
  { adquisicion: "20", descuento: "10", comision: 20, bonificacion: 10, label: labelFor("20", "10") },
  { adquisicion: "20", descuento: "15", comision: 20, bonificacion: 15, label: labelFor("20", "15") },
  { adquisicion: "20", descuento: "20", comision: 20, bonificacion: 20, label: labelFor("20", "20") },
  { adquisicion: "25", descuento: "0", comision: 25, bonificacion: 0, label: labelFor("25", "0") },
  { adquisicion: "30", descuento: "0", comision: 30, bonificacion: 0, label: labelFor("30", "0") },
]

export const defaultGastosAdquisicion =
  gastosAdquisicion.find((item) => item.adquisicion === "10" && item.descuento === "10") ??
  gastosAdquisicion[2]

export function isAdquisicionPercent(value: string): value is AdquisicionPercent {
  return adquisicionPercents.some((item) => item === value)
}

export function isDescuentoPercent(value: string): value is DescuentoPercent {
  return descuentoPercents.some((item) => item === value)
}

export function descuentosForAdquisicion(adquisicion: AdquisicionPercent): DescuentoPercent[] {
  const allowed = new Set(
    gastosAdquisicion
      .filter((item) => item.adquisicion === adquisicion)
      .map((item) => item.descuento),
  )
  return descuentoPercents.filter((item) => allowed.has(item))
}

export function isAllowedGastos(comision: number, bonificacion: number) {
  return gastosAdquisicion.some(
    (item) => item.comision === comision && item.bonificacion === bonificacion,
  )
}

export function resolveGastos(
  adquisicion: string | null | undefined,
  descuento: string | null | undefined,
): GastosAdquisicion {
  const rawAdquisicion = adquisicion ?? ""
  const acquisition = isAdquisicionPercent(rawAdquisicion)
    ? rawAdquisicion
    : defaultGastosAdquisicion.adquisicion
  const allowed = descuentosForAdquisicion(acquisition)
  const rawDescuento = descuento ?? ""
  const discount =
    isDescuentoPercent(rawDescuento) && allowed.includes(rawDescuento)
      ? rawDescuento
      : "0"
  return (
    gastosAdquisicion.find(
      (item) => item.adquisicion === acquisition && item.descuento === discount,
    ) ?? defaultGastosAdquisicion
  )
}

export function gastosFromPercents(
  comision: number | null | undefined,
  bonificacion: number | null | undefined,
): GastosAdquisicion {
  return resolveGastos(
    comision == null ? undefined : String(comision),
    bonificacion == null ? undefined : String(bonificacion),
  )
}

export function adquisicionLabel(value: AdquisicionPercent) {
  return `${value}%`
}

export function descuentoLabel(value: DescuentoPercent) {
  return value === "0" ? "Sin descuento" : `${value}%`
}
