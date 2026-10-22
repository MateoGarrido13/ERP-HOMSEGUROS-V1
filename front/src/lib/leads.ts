import { withAsegurado } from "@/lib/asegurado-search"
import { digitsOnly, formatPesos } from "@/lib/format"
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
}

const otherBrokerPremium = formatPesos(145000)
const newCarPremium = formatPesos(210000)
const nicolasPremium = formatPesos(187900)

export const leads: Lead[] = [
  {
    id: "nicolas-cotizacion",
    holder: "Nicolás Ferreyra",
    ramo: "Automotor",
    origin: "Cotización enviada",
    description: `Se le envió una cotización de terceros completo y optó por otro productor. Anunció que paga ${otherBrokerPremium} por mes. Hoy no tiene póliza vigente.`,
    phone: "11 5842-7731",
    phoneHref: "tel:+541158427731",
    updatedOn: "2026-09-18",
    quotePath: "/cotizar/automotor",
    proposal: {
      good: "Volkswagen Gol Trend",
      coverage: "Terceros completo",
      company: "Mercantil Andina",
      premium: nicolasPremium,
    },
  },
  {
    id: "elena-retiro",
    holder: "Elena Varela",
    ramo: "Hogar",
    origin: "Retiró el bien",
    description: "Era clienta de Hogar y retiró la vivienda. Hoy no tiene una póliza vigente.",
    phone: "11 4790-2264",
    phoneHref: "tel:+541147902264",
    updatedOn: "2026-08-20",
    quotePath: "/cotizar/hogar",
  },
  {
    id: "julian-retiro",
    holder: "Julián Paz",
    ramo: "Automotor",
    origin: "Retiró el bien",
    description: `Era cliente de Automotor y vendió el vehículo. Anunció que el seguro del auto nuevo lo paga en ${newCarPremium} por mes con otro productor. Hoy no tiene póliza vigente.`,
    phone: "11 5128-9044",
    phoneHref: "tel:+541151289044",
    updatedOn: "2026-09-28",
    quotePath: "/cotizar/automotor",
  },
]

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

export function leadQuoteHref(lead: Lead) {
  const [nombre = "", ...rest] = lead.holder.split(" ")

  return withAsegurado(lead.quotePath, {
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
  }
}
