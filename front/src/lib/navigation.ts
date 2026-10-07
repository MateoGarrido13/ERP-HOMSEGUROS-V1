export const tabs = [
  { id: "cotizar", href: "/cotizar", label: "Cotizar" },
  { id: "cartera", href: "/cartera", label: "Cartera" },
  { id: "pendientes", href: "/pendientes", label: "Pendientes" },
  { id: "siniestros", href: "/siniestros", label: "Siniestros" },
  { id: "perfil", href: "/perfil", label: "Perfil" },
] as const

export type TabId = (typeof tabs)[number]["id"]

const screens: { prefix: string; kicker: string; tab: TabId }[] = [
  { prefix: "/cotizar/enviado", kicker: "Enviado", tab: "cotizar" },
  { prefix: "/cotizar/pdf", kicker: "Propuesta PDF", tab: "cotizar" },
  { prefix: "/cotizar/propuesta", kicker: "Propuesta", tab: "cotizar" },
  { prefix: "/cotizar/comparar", kicker: "", tab: "cotizar" },
  { prefix: "/cotizar/riesgo", kicker: "Datos del riesgo", tab: "cotizar" },
  { prefix: "/cotizar/art/enviado", kicker: "Solicitud enviada", tab: "cotizar" },
  { prefix: "/cotizar/art/asegurado", kicker: "Datos del asegurado", tab: "cotizar" },
  { prefix: "/cotizar/art", kicker: "Cotizar ART", tab: "cotizar" },
  { prefix: "/cotizar/accidentes/enviado", kicker: "Solicitud enviada", tab: "cotizar" },
  { prefix: "/cotizar/accidentes/asegurado", kicker: "Datos del asegurado", tab: "cotizar" },
  { prefix: "/cotizar/accidentes", kicker: "Cotizar accidentes", tab: "cotizar" },
  { prefix: "/cotizar/hogar/enviado", kicker: "Solicitud enviada", tab: "cotizar" },
  { prefix: "/cotizar/hogar/asegurado", kicker: "Datos del asegurado", tab: "cotizar" },
  { prefix: "/cotizar/hogar", kicker: "Cotizar hogar", tab: "cotizar" },
  { prefix: "/cotizar/automotor", kicker: "Cotizar auto", tab: "cotizar" },
  { prefix: "/cotizar", kicker: "Cotizar", tab: "cotizar" },
  { prefix: "/cartera", kicker: "Cartera", tab: "cartera" },
  { prefix: "/pendientes", kicker: "Pendientes", tab: "pendientes" },
  { prefix: "/siniestros", kicker: "Siniestros", tab: "siniestros" },
  { prefix: "/perfil", kicker: "Perfil", tab: "perfil" },
]

export function screenForPath(pathname: string) {
  return (
    screens.find((screen) => pathname.startsWith(screen.prefix)) ??
    screens.find((screen) => screen.prefix === "/cotizar")!
  )
}
