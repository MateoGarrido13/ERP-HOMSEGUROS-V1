import { withAsegurado } from "@/lib/asegurado-search"
import { automotorQuoteHref, type AutomotorConsulta } from "@/lib/automotor-consulta"
import { digitsOnly } from "@/lib/format"
import type { NoticeQuote } from "@/lib/pendientes"

export interface LeadProposal {
  good: string
  coverage: string
  company: string
  premium: string
}

export interface Lead {
  id: string
  holder: string
  ramo: string
  origin: string
  description: string
  phone: string
  phoneHref: string
  updatedOn: string
  quotePath: string
  proposal?: LeadProposal
  automotor?: AutomotorConsulta
}

/** Los leads de automotor se leen de PostgreSQL (cotizaciones Mercantil), no de este arreglo. */
export const leads: Lead[] = []

export function leadCountLabel(count: number) {
  return count === 1 ? "1 lead" : `${count} leads`
}

export function quotePathFor(ramo: string) {
  if (ramo === "Hogar") return "/cotizar/hogar"
  if (ramo === "ART") return "/cotizar/art"
  if (ramo.includes("Accidentes")) return "/cotizar/accidentes"
  return "/cotizar/automotor"
}

export function phoneHrefOf(phone: string) {
  const digits = digitsOnly(phone)
  return digits ? `tel:+54${digits}` : ""
}

export function leadCanRecotizar(lead: Lead) {
  return lead.origin === "Cotización enviada" && Boolean(lead.automotor)
}

export function leadQuoteHref(lead: Lead) {
  const [nombre = "", ...rest] = lead.holder.split(" ")
  const path = lead.automotor
    ? automotorQuoteHref(lead.quotePath, lead.automotor)
    : lead.quotePath

  return withAsegurado(path, {
    nombre,
    apellido: rest.join(" "),
    telefono: digitsOnly(lead.phone),
    email: "",
    dni: "",
    comentarios: lead.description,
  })
}

export function rejectedQuoteLead(input: {
  noticeId: string
  holder: string
  ramo: string
  phone: string | null
  quote?: NoticeQuote
  comment: string
  updatedOn: string
}): Lead {
  const quote = input.quote
  const offered = quote
    ? `Quería asegurar ${quote.good}. Se ofreció ${quote.coverage} en ${quote.company} por ${quote.premium} por mes.`
    : ""
  const description = [input.comment.trim(), offered].filter(Boolean).join(" ")
  const phone = input.phone ?? ""

  return {
    id: `lead-${input.noticeId}`,
    holder: input.holder,
    ramo: input.ramo,
    origin: "Cotización enviada",
    description,
    phone,
    phoneHref: phoneHrefOf(phone),
    updatedOn: input.updatedOn,
    quotePath: quotePathFor(input.ramo),
    proposal: quote,
    automotor: quote?.automotor,
  }
}
