import "server-only"

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Falta ${name} en el entorno del servidor.`)
  }
  return value
}

function numberEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name])
  return Number.isFinite(parsed) ? parsed : fallback
}

export function mercantilConfig() {
  return {
    baseUrl: (process.env.MA_API_BASE ?? "https://apidev.mercantilandina.com.ar").replace(
      /\/$/,
      "",
    ),
    subscriptionKey: required("MA_SUBSCRIPTION_KEY"),
    username: required("MA_USERNAME"),
    password: required("MA_PASSWORD"),
    productorId: numberEnv("MA_PRODUCTOR_ID", 83645),
    comision: numberEnv("MA_COMISION", 10),
    bonificacion: numberEnv("MA_BONIFICACION", 10),
    iva: 5,
    periodo: 1,
    cuotas: 1,
    tipoPago: "C",
  }
}
