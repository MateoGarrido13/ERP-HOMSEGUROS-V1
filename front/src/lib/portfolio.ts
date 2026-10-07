import { parseAsStringLiteral } from "nuqs/server"

import { formatShortDate } from "@/lib/format"
import { producer } from "@/lib/mock-pas"
import type { CompanyId } from "@/lib/quote-search"
import { companyIds } from "@/lib/quote-search"

export const ramoIds = ["automotor", "hogar", "art"] as const
export type RamoId = (typeof ramoIds)[number]

export const ramoLabels: Record<RamoId, string> = {
  automotor: "Automotor",
  hogar: "Hogar",
  art: "ART",
}

export const ramoColors: Record<RamoId, string> = {
  automotor: "#10c0c0",
  hogar: "#ff9f1c",
  art: "#110229",
}

export const companyLabels: Record<CompanyId, string> = {
  sancor: "Sancor",
  mercantil: "Mercantil Andina",
  allianz: "Allianz",
}

export const localityIds = [
  "vicente-lopez",
  "martinez",
  "olivos",
  "san-isidro",
  "tigre",
] as const

export type LocalityId = (typeof localityIds)[number]

export const localityLabels: Record<LocalityId, string> = {
  "vicente-lopez": "Vicente López",
  martinez: "Martínez",
  olivos: "Olivos",
  "san-isidro": "San Isidro",
  tigre: "Tigre",
}

export interface PortfolioPolicy {
  id: string
  holderId: string
  holder: string
  company: CompanyId
  locality: LocalityId
  ramo: RamoId
  policy: string
  nextCharge: string
}

export interface PortfolioClient {
  id: string
  holder: string
  policies: PortfolioPolicy[]
}

export const portfolioPolicies: PortfolioPolicy[] = [
  {
    id: "laura-auto",
    holderId: "laura",
    holder: "Laura Pérez",
    company: "sancor",
    locality: "vicente-lopez",
    ramo: "automotor",
    policy: "450221",
    nextCharge: "2026-11-01",
  },
  {
    id: "laura-hogar",
    holderId: "laura",
    holder: "Laura Pérez",
    company: "mercantil",
    locality: "vicente-lopez",
    ramo: "hogar",
    policy: "220540",
    nextCharge: "2026-11-18",
  },
  {
    id: "diego",
    holderId: "diego",
    holder: "Diego Ruiz",
    company: "allianz",
    locality: "martinez",
    ramo: "automotor",
    policy: "881204",
    nextCharge: "2026-11-03",
  },
  {
    id: "sofia",
    holderId: "sofia",
    holder: "Sofía Herrera",
    company: "sancor",
    locality: "olivos",
    ramo: "automotor",
    policy: "450908",
    nextCharge: "2026-11-08",
  },
  {
    id: "pablo",
    holderId: "pablo",
    holder: "Pablo Quiroga",
    company: "mercantil",
    locality: "martinez",
    ramo: "automotor",
    policy: "220441",
    nextCharge: "2026-11-12",
  },
  {
    id: "ana",
    holderId: "ana",
    holder: "Ana Molina",
    company: "mercantil",
    locality: "olivos",
    ramo: "hogar",
    policy: "220118",
    nextCharge: "2026-11-05",
  },
  {
    id: "carlos",
    holderId: "carlos",
    holder: "Carlos Benítez",
    company: "sancor",
    locality: "san-isidro",
    ramo: "hogar",
    policy: "451330",
    nextCharge: "2026-11-20",
  },
  {
    id: "martin",
    holderId: "martin",
    holder: "Martín Acosta",
    company: "allianz",
    locality: "san-isidro",
    ramo: "hogar",
    policy: "882015",
    nextCharge: "2026-11-15",
  },
  {
    id: "estudio-norte",
    holderId: "estudio-norte",
    holder: "Estudio Norte SRL",
    company: "allianz",
    locality: "vicente-lopez",
    ramo: "art",
    policy: "883102",
    nextCharge: "2026-11-10",
  },
  {
    id: "panaderia",
    holderId: "panaderia",
    holder: "Panadería Sur",
    company: "mercantil",
    locality: "tigre",
    ramo: "art",
    policy: "221770",
    nextCharge: "2026-11-22",
  },
  {
    id: "logistica",
    holderId: "logistica",
    holder: "Logística Delta SA",
    company: "sancor",
    locality: "tigre",
    ramo: "art",
    policy: "452014",
    nextCharge: "2026-11-28",
  },
]

export interface PortfolioFilters {
  company: CompanyId | null
  locality: LocalityId | null
  ramo: RamoId | null
}

export const portfolioParsers = {
  compania: parseAsStringLiteral(companyIds),
  localidad: parseAsStringLiteral(localityIds),
  ramo: parseAsStringLiteral(ramoIds),
}

export interface RamoShare {
  id: RamoId
  label: string
  color: string
  count: number
  percent: number
}

export function ramoShares(policies: PortfolioPolicy[]): RamoShare[] {
  const present = ramoIds
    .map((id) => ({
      id,
      count: policies.filter((policy) => policy.ramo === id).length,
    }))
    .filter((item) => item.count > 0)

  const percents = percentShares(present.map((item) => item.count))

  return present.map((item, index) => ({
    id: item.id,
    label: ramoLabels[item.id],
    color: ramoColors[item.id],
    count: item.count,
    percent: percents[index] ?? 0,
  }))
}

export function policyShareMessage(policy: PortfolioPolicy) {
  const firstName = policy.holder.split(" ")[0] ?? policy.holder

  return `Hola ${firstName}, soy ${producer.name} de HOM Seguros. Te envío la póliza de ${ramoLabels[policy.ramo]} de ${companyLabels[policy.company]}. Estás al día y el próximo vencimiento es el ${formatShortDate(policy.nextCharge)}, por débito automático.`
}

export function groupClients(policies: PortfolioPolicy[]): PortfolioClient[] {
  const groups = new Map<string, PortfolioPolicy[]>()

  for (const policy of policies) {
    const current = groups.get(policy.holderId) ?? []
    current.push(policy)
    groups.set(policy.holderId, current)
  }

  return [...groups.entries()].map(([id, items]) => ({
    id,
    holder: items[0]?.holder ?? "",
    policies: items,
  }))
}

export function filterPolicies(
  policies: PortfolioPolicy[],
  filters: PortfolioFilters,
) {
  return policies.filter((policy) => {
    if (filters.company && policy.company !== filters.company) return false
    if (filters.locality && policy.locality !== filters.locality) return false
    if (filters.ramo && policy.ramo !== filters.ramo) return false
    return true
  })
}

export function isCompanyId(value: string): value is CompanyId {
  return companyIds.some((id) => id === value)
}

export function isLocalityId(value: string): value is LocalityId {
  return localityIds.some((id) => id === value)
}

export function isRamoId(value: string): value is RamoId {
  return ramoIds.some((id) => id === value)
}

function percentShares(counts: number[]) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return counts.map(() => 0)

  const exact = counts.map((count) => (count / total) * 100)
  const floors = exact.map((value) => Math.floor(value))
  let leftover = 100 - floors.reduce((sum, value) => sum + value, 0)
  const order = exact
    .map((value, index) => ({ index, remainder: value - floors[index] }))
    .sort((left, right) => right.remainder - left.remainder)

  for (const item of order) {
    if (leftover <= 0) break
    floors[item.index] += 1
    leftover -= 1
  }

  return floors
}
