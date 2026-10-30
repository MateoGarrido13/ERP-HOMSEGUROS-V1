export function formatPesos(amount: number) {
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(amount)

  return `$ ${formatted}`
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

export function elapsedDays(fromIsoDate: string, today = new Date()) {
  const [year, month, day] = fromIsoDate.split("-").map(Number)
  const from = new Date(year, month - 1, day)
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = startToday.getTime() - from.getTime()

  return Math.max(0, Math.round(diff / 86_400_000))
}

export function formatShortDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

export function isoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatElapsedDays(days: number) {
  if (days === 0) return "Cargado hoy"
  if (days === 1) return "1 día transcurrido"
  return `${days} días transcurridos`
}
