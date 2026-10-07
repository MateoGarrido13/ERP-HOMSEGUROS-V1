import { formatPesos } from "@/lib/format"
import { producer } from "@/lib/mock-pas"

export const pendingWhatsappLabel = "Enviar WhatsApp"

export interface PendingDetail {
  label: string
  lines: string[]
}

export interface PendingNotice {
  id: string
  label: string
  holder: string
  summary: string
  comment: string
  tone: "alert" | "mint" | "ok"
  pill: "cargando" | "gestion" | "listo"
  details: PendingDetail[]
  message: string
}

const rejectedAmount = formatPesos(191050)
const offeredPremium = formatPesos(184320)
const insuredSum = formatPesos(18400000)

export const pendingNotices: PendingNotice[] = [
  {
    id: "diego-pago",
    label: "Pago rechazado",
    holder: "Diego Ruiz",
    summary: "Automotor · Allianz",
    comment:
      "Tiene terceros completo en el ramo Automotor. El rechazo de la cuota deja la cobertura en riesgo.",
    tone: "alert",
    pill: "cargando",
    details: [
      {
        label: "Medio de pago",
        lines: [
          "Débito automático",
          "Visa terminada en 4412",
          `Cuota 3 · ${rejectedAmount}`,
          "Motivo: fondos insuficientes",
        ],
      },
    ],
    message: `Hola Diego, soy ${producer.name} de HOM Seguros. El débito automático de la cuota 3 de tu póliza Allianz de Automotor, con la Visa terminada en 4412, fue rechazado por fondos insuficientes. Tenés terceros completo y la cobertura está en riesgo. ¿Coordinamos el pago?`,
  },
  {
    id: "laura-cumple",
    label: "Cumpleaños",
    holder: "Laura Pérez",
    summary: "Automotor · Sancor · hoy, 5 de octubre",
    comment:
      "Tiene terceros completo en el ramo Automotor, con Sancor. Hoy es su cumpleaños.",
    tone: "mint",
    pill: "gestion",
    details: [],
    message: `Hola Laura, soy ${producer.name} de HOM Seguros. ¡Feliz cumpleaños! Te deseo un excelente día.`,
  },
  {
    id: "camila-cotizacion",
    label: "Cotización enviada",
    holder: "Camila Torres",
    summary: "Automotor · Sancor · Sin confirmación",
    comment: `Se le ofreció terceros completo en el ramo Automotor, con Sancor, por ${offeredPremium} por mes. La cotización está enviada y todavía no confirmó.`,
    tone: "ok",
    pill: "listo",
    details: [
      {
        label: "Bien asegurado",
        lines: [
          "Chevrolet Onix 1.2 LT",
          "Patente AE 458 JK",
          "2022 · uso particular · sin GNC · usado",
          "Vicente López · CP 1640",
          `Suma asegurada ${insuredSum}`,
        ],
      },
    ],
    message: `Hola Camila, soy ${producer.name} de HOM Seguros. Te escribo por la cotización de tu Chevrolet Onix 1.2 LT, patente AE 458 JK. Te ofrecimos terceros completo en Sancor por ${offeredPremium} por mes y todavía no la confirmaste. ¿La avanzamos?`,
  },
]
