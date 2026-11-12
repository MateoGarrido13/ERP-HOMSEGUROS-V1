import type { AutomotorConsulta } from "@/lib/automotor-consulta"
import { formatPesos, formatShortDate } from "@/lib/format"

export const pendingWhatsappLabel = "Enviar WhatsApp"
export const waitingLabel = "Esperando respuesta cliente"

export const noticeTypes = [
  "pago-rechazado",
  "cumpleanos",
  "cotizacion-enviada",
  "enviar-poliza",
  "enviar-cupon",
] as const

export type NoticeType = (typeof noticeTypes)[number]
export type NoticeStatus = "pendiente" | "esperando-respuesta" | "cobro-pendiente"

export const noticeTypeLabels: Record<NoticeType, string> = {
  "pago-rechazado": "Pago rechazado",
  cumpleanos: "Cumpleaños",
  "cotizacion-enviada": "Cotización enviada",
  "enviar-poliza": "Enviar póliza",
  "enviar-cupon": "Enviar cupón",
}

export const cobroPendienteLabel = "Cobro pendiente"

export interface NoticeCoverage {
  ramo: string
  company: string
}

export interface NoticeQuote {
  good: string
  coverage: string
  company: string
  premium: string
  automotor?: AutomotorConsulta
}

export interface NoticePayment {
  method: string
  installment: string
  reason: string
  company: string
  ramo: string
}

export interface NoticePolicy {
  ramo: string
  company: string
  dueOn: string
  number?: string
  building?: string
  vigenciaFrom?: string
  vigenciaTo?: string
  administrator?: string
}

export interface PendingNotice {
  id: string
  type: NoticeType
  status: NoticeStatus
  holder: string
  coverage: string
  dueOn: string
  phone: string | null
  tone: "alert" | "mint" | "ok"
  pill: "cargando" | "gestion" | "listo"
  coverages: NoticeCoverage[]
  quote?: NoticeQuote
  payment?: NoticePayment
  policy?: NoticePolicy
}

const offeredPremium = formatPesos(184320)

export const pendingNotices: PendingNotice[] = [
  {
    id: "diego-pago",
    type: "pago-rechazado",
    status: "pendiente",
    holder: "Diego Ruiz",
    coverage: "Automotor",
    dueOn: "2026-10-21",
    phone: "11 4555-2210",
    tone: "alert",
    pill: "cargando",
    coverages: [{ ramo: "Automotor", company: "Allianz" }],
    payment: {
      method: "Débito automático",
      installment: "3",
      reason: "Fondos insuficientes",
      company: "Allianz",
      ramo: "Automotor",
    },
  },
  {
    id: "laura-cumple",
    type: "cumpleanos",
    status: "pendiente",
    holder: "Laura Pérez",
    coverage: "Automotor y Hogar",
    dueOn: "2026-10-21",
    phone: "11 4780-3344",
    tone: "mint",
    pill: "gestion",
    coverages: [
      { ramo: "Automotor", company: "Sancor" },
      { ramo: "Hogar", company: "Mercantil Andina" },
    ],
  },
  {
    id: "camila-cotizacion",
    type: "cotizacion-enviada",
    status: "pendiente",
    holder: "Camila Torres",
    coverage: "Automotor",
    dueOn: "2026-10-18",
    phone: "11 4702-1188",
    tone: "ok",
    pill: "listo",
    coverages: [{ ramo: "Automotor", company: "Sancor" }],
    quote: {
      good: "Chevrolet Onix 1.2 LT",
      coverage: "Terceros completo",
      company: "Sancor",
      premium: offeredPremium,
    },
  },
  {
    id: "jorge-poliza",
    type: "enviar-poliza",
    status: "pendiente",
    holder: "Jorge Fernández",
    coverage: "Automotor",
    dueOn: "2026-10-26",
    phone: "11 4620-8891",
    tone: "mint",
    pill: "gestion",
    coverages: [{ ramo: "Automotor", company: "Sancor" }],
    policy: {
      ramo: "Automotor",
      company: "Sancor",
      dueOn: "2026-10-26",
    },
  },
  {
    id: "torres-iv-cupon",
    type: "enviar-cupon",
    status: "pendiente",
    holder: "TORRES IV",
    coverage: "Consorcio",
    dueOn: "2026-11-10",
    phone: "11 5033-2218",
    tone: "mint",
    pill: "gestion",
    coverages: [{ ramo: "Consorcio", company: "Mercantil Andina" }],
    policy: {
      ramo: "Consorcio",
      company: "Mercantil Andina",
      dueOn: "2026-11-10",
      number: "330418",
      building: "TORRES IV",
      vigenciaFrom: "2026-05-20",
      vigenciaTo: "2027-05-20",
      administrator: "Marta López",
    },
  },
]

export function avisoCountLabel(count: number) {
  return count === 1 ? "1 aviso" : `${count} avisos`
}

export function noticeLabel(notice: PendingNotice) {
  if (notice.status === "cobro-pendiente") return cobroPendienteLabel
  return noticeTypeLabels[notice.type]
}

export function noticeCardTone(notice: PendingNotice) {
  if (notice.status === "esperando-respuesta") return "mint" as const
  return notice.tone
}

export function firstNameOf(holder: string) {
  return holder.split(" ")[0] ?? holder
}

export function noticeWhatsappMessage(notice: PendingNotice, pasName: string) {
  const name = firstNameOf(notice.holder)

  if (notice.type === "cumpleanos") {
    return `Hola ${name}, soy ${pasName} de HOM Seguros. ¡Feliz cumpleaños! Te deseo un excelente día.`
  }

  if (notice.type === "pago-rechazado" && notice.payment) {
    const payment = notice.payment
    return `Hola ${name}, soy ${pasName} de HOM Seguros. El débito automático de la cuota ${payment.installment} de tu póliza ${payment.company} de ${payment.ramo} fue rechazado. La cobertura está en riesgo. ¿Coordinamos el pago?`
  }

  if (notice.type === "cotizacion-enviada" && notice.quote) {
    const quote = notice.quote
    return `Hola ${name}, soy ${pasName} de HOM Seguros. Te escribo por la cotización de ${quote.good}. Te ofrecimos ${quote.coverage} en ${quote.company} por ${quote.premium} por mes y todavía no la confirmaste. ¿La avanzamos?`
  }

  if (notice.type === "enviar-poliza" && notice.policy) {
    const policy = notice.policy
    return `Hola ${name}, soy ${pasName} de HOM Seguros. Te envío la póliza de ${policy.ramo} de ${policy.company}. Estás al día y el próximo vencimiento es el ${formatShortDate(policy.dueOn)}, por débito automático.`
  }

  if (notice.type === "enviar-cupon" && notice.policy) {
    const policy = notice.policy
    const admin = firstNameOf(policy.administrator ?? notice.holder)
    return `Hola ${admin}, soy ${pasName} de HOM Seguros. Te envío el cupón del próximo cobro del edificio ${policy.building}, póliza ${policy.number} de ${policy.company}. El vencimiento es el ${formatShortDate(policy.dueOn)}.`
  }

  return `Hola ${name}, soy ${pasName} de HOM Seguros.`
}

export function whatsappClosesNotice(notice: PendingNotice) {
  return notice.type === "cumpleanos" || notice.type === "enviar-poliza"
}

export function whatsappMarksCobroPendiente(notice: PendingNotice) {
  return notice.type === "enviar-cupon" && notice.status === "pendiente"
}

export function whatsappWaitsForClient(notice: PendingNotice) {
  return notice.type === "pago-rechazado" && notice.status === "pendiente"
}

export function quoteNoticeFromLead(input: {
  leadId: string
  holder: string
  ramo: string
  phone: string | null
  quote?: NoticeQuote
  dueOn: string
}): PendingNotice {
  return {
    id: `aviso-${input.leadId}`,
    type: "cotizacion-enviada",
    status: "pendiente",
    holder: input.holder,
    coverage: input.ramo,
    dueOn: input.dueOn,
    phone: input.phone,
    tone: "ok",
    pill: "listo",
    coverages: input.quote
      ? [{ ramo: input.ramo, company: input.quote.company }]
      : [],
    quote: input.quote,
  }
}
