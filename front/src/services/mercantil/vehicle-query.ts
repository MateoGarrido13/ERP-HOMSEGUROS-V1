/** GET /vehiculos `q` longer than this returns ERR0014. */
export const VEHICLE_QUERY_MAX_LENGTH = 28

function collapse(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function clipToMax(text: string, max: number) {
  if (text.length <= max) return text
  const words = text.split(" ")
  let out = ""
  for (const word of words) {
    const next = out ? `${out} ${word}` : word
    if (next.length > max) break
    out = next
  }
  return out
}

export function vehicleSearchQueries(marca: string, modelo: string) {
  const model = collapse(modelo)
  const brand = collapse(marca)
  const queries: string[] = []

  function add(value: string) {
    const clipped = clipToMax(collapse(value), VEHICLE_QUERY_MAX_LENGTH)
    if (clipped.length >= 3 && !queries.includes(clipped)) queries.push(clipped)
  }

  add(model)
  add(`${brand} ${model}`)

  const words = model.split(" ").filter(Boolean)
  for (let count = words.length - 1; count >= 2; count -= 1) {
    const shortened = words.slice(0, count).join(" ")
    add(shortened)
    add(`${brand} ${shortened}`)
  }

  return queries
}
