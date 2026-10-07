import { formatPesos } from "@/lib/format"

export interface Lead {
  id: string
  holder: string
  ramo: string
  origin: string
  comment: string
  phone: string
  phoneHref: string
  updatedOn: string
}

const otherBrokerPremium = formatPesos(145000)
const newCarPremium = formatPesos(210000)

export const leads: Lead[] = [
  {
    id: "nicolas-cotizacion",
    holder: "Nicolás Ferreyra",
    ramo: "Automotor",
    origin: "Cotización enviada",
    comment: `Se le envió una cotización de terceros completo y optó por otro productor. Anunció que paga ${otherBrokerPremium} por mes. Hoy no tiene póliza vigente.`,
    phone: "11 5842-7731",
    phoneHref: "tel:+541158427731",
    updatedOn: "2026-09-18",
  },
  {
    id: "elena-retiro",
    holder: "Elena Varela",
    ramo: "Hogar",
    origin: "Retiró el bien",
    comment:
      "Era clienta de Hogar y retiró la vivienda. Hoy no tiene una póliza vigente.",
    phone: "11 4790-2264",
    phoneHref: "tel:+541147902264",
    updatedOn: "2026-08-20",
  },
  {
    id: "julian-retiro",
    holder: "Julián Paz",
    ramo: "Automotor",
    origin: "Retiró el bien",
    comment: `Era cliente de Automotor y vendió el vehículo. Anunció que el seguro del auto nuevo lo paga en ${newCarPremium} por mes con otro productor. Hoy no tiene póliza vigente.`,
    phone: "11 5128-9044",
    phoneHref: "tel:+541151289044",
    updatedOn: "2026-09-28",
  },
]
