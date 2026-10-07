import type { CompanyId } from "@/lib/quote-search"

export const producer = {
  name: "Martín Gómez",
  license: "42.108",
  role: "PAS",
}

export const holder = {
  name: "Laura Pérez",
  plate: "AB 123 CD",
}

export interface Offer {
  id: CompanyId
  name: string
  coverage: string
  monthly: number
  premium: number
  surcharges: number
  taxes: number
  isRecommended: boolean
}

export const offers: Offer[] = [
  {
    id: "sancor",
    name: "Sancor",
    coverage: "Terceros completo",
    monthly: 184320,
    premium: 152000,
    surcharges: 12400,
    taxes: 19920,
    isRecommended: true,
  },
  {
    id: "mercantil",
    name: "Mercantil Andina",
    coverage: "Terceros completo",
    monthly: 187900,
    premium: 155200,
    surcharges: 12600,
    taxes: 20100,
    isRecommended: false,
  },
  {
    id: "allianz",
    name: "Allianz",
    coverage: "Terceros completo",
    monthly: 191050,
    premium: 157800,
    surcharges: 12840,
    taxes: 20410,
    isRecommended: false,
  },
]

export function offerById(id: CompanyId) {
  return offers.find((offer) => offer.id === id) ?? offers[0]
}

export const modelLines = ["Onix 1.2 LT"]

export const decodedRisk = {
  brand: "Chevrolet",
  line: modelLines[0],
  isNew: false,
  hasGnc: false,
  referenceSum: 18400000,
  localityByPostalCode: {
    "1640": "Vicente López",
  } as Record<string, string>,
}

export const debitNotice =
  "Hola Diego, soy Martín Gómez de HOM Seguros. El débito de la cuota 3 de tu póliza Allianz fue rechazado y la cobertura está en riesgo. ¿Coordinamos el pago?"

export const policyNotice =
  "Hola Laura, soy Martín Gómez de HOM Seguros. Te envío la póliza de Sancor. Estás al día y el próximo vencimiento es el 01/10, por débito automático."

export const claimStatuses = {
  gestion: { label: "En gestión", tone: "gestion" as const, card: "mint" as const },
  documentacion: {
    label: "Documentación pendiente",
    tone: "cargando" as const,
    card: "alert" as const,
  },
  cerrado: { label: "Cerrado", tone: "listo" as const, card: "ok" as const },
}

export type ClaimStatus = keyof typeof claimStatuses

export interface ClaimContact {
  role: string
  name: string
  phone: string
  phoneHref: string
}

export interface Claim {
  id: string
  holder: string
  branch: string
  company: string
  registeredOn: string
  status: ClaimStatus
  comment: string
  contacts: ClaimContact[]
}

export const claims: Claim[] = [
  {
    id: "laura-choque",
    holder: "Laura Pérez",
    branch: "Automotor",
    company: "Sancor",
    registeredOn: "2026-09-22",
    status: "gestion",
    comment:
      "Declaró un choque trasero al estacionar en Vicente López. Sin lesionados. Tiene fotos del otro vehículo y de la patente.",
    contacts: [
      {
        role: "Gestor asignado",
        name: "Carla Benítez",
        phone: "11 4821-3340",
        phoneHref: "tel:+541148213340",
      },
      {
        role: "Estudio liquidador",
        name: "Estudio Rivas",
        phone: "11 4780-2215",
        phoneHref: "tel:+541147802215",
      },
    ],
  },
  {
    id: "diego-granizo",
    holder: "Diego Ruiz",
    branch: "Automotor",
    company: "Allianz",
    registeredOn: "2026-10-02",
    status: "documentacion",
    comment:
      "Declaró granizo sobre el techo y el capó. No hay denuncia policial. Faltan las fotos del daño y el presupuesto del taller.",
    contacts: [
      {
        role: "Gestor asignado",
        name: "Pablo Herrera",
        phone: "11 5033-8812",
        phoneHref: "tel:+541150338812",
      },
      {
        role: "Estudio liquidador",
        name: "Estudio Molina Peritos",
        phone: "11 5264-1093",
        phoneHref: "tel:+541152641093",
      },
    ],
  },
  {
    id: "ana-hogar",
    holder: "Ana Molina",
    branch: "Hogar",
    company: "Mercantil Andina",
    registeredOn: "2026-08-10",
    status: "cerrado",
    comment:
      "Declaró una filtración en el living después de una lluvia fuerte. El daño quedó en el cielorraso y en un mueble.",
    contacts: [
      {
        role: "Gestor asignado",
        name: "Lucía Ferreyra",
        phone: "11 4560-2291",
        phoneHref: "tel:+541145602291",
      },
      {
        role: "Estudio liquidador",
        name: "Estudio Quiroga",
        phone: "11 4312-7740",
        phoneHref: "tel:+541143127740",
      },
    ],
  },
]

export const collections = [
  {
    id: "diego",
    label: "DÉBITO RECHAZADO",
    title: "Diego Ruiz · Allianz",
    detail: "Cuota 3 · medio: débito automático",
    note: "Rechazo hace 1 día. Cobertura en riesgo.",
    tone: "alert" as const,
    actionLabel: "Avisar a Diego por WhatsApp",
    message: debitNotice,
  },
  {
    id: "laura",
    label: "AL DÍA",
    title: "Laura Pérez · Sancor",
    detail: "Próximo vencimiento 01/10 · débito",
    note: "",
    tone: "ok" as const,
    actionLabel: "Enviar póliza",
    message: policyNotice,
  },
]

export const proposalTrace = {
  code: "TRAZA RF02 / RNF03",
  when: "25 sep 10:42",
  version: "PDF v1",
}
