"use client"

import { useState } from "react"
import { useQueryStates } from "nuqs"

import { ShareNotice } from "@/components/collections/share-notice"
import { SurfaceCard } from "@/components/ui/surface-card"
import { SelectField } from "@/components/ui/text-field"
import { formatShortDate } from "@/lib/format"
import {
  companyLabels,
  filterPolicies,
  groupClients,
  isCompanyId,
  isLocalityId,
  isRamoId,
  localityIds,
  localityLabels,
  policyShareMessage,
  portfolioParsers,
  portfolioPolicies,
  ramoIds,
  ramoLabels,
  type PortfolioPolicy,
} from "@/lib/portfolio"
import { companyIds } from "@/lib/quote-search"

export function ClientSearch() {
  const [filters, setFilters] = useQueryStates(portfolioParsers)
  const [openId, setOpenId] = useState<string | null>(null)
  const clients = groupClients(
    filterPolicies(portfolioPolicies, {
      company: filters.compania,
      locality: filters.localidad,
      ramo: filters.ramo,
    }),
  )
  const hasFilters = Boolean(filters.compania || filters.localidad || filters.ramo)

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-2.5">
      <SurfaceCard>
        <p className="text-[11px] font-medium tracking-wide text-muted">BUSCAR CLIENTES</p>
        <div className="mt-3 flex flex-col gap-3">
          <SelectField
            label="Compañía"
            name="compania"
            value={filters.compania ?? ""}
            onChange={(event) => {
              const value = event.target.value
              void setFilters({ compania: isCompanyId(value) ? value : null })
            }}
          >
            <option value="">Todas</option>
            {companyIds.map((id) => (
              <option key={id} value={id}>
                {companyLabels[id]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Localidad"
            name="localidad"
            value={filters.localidad ?? ""}
            onChange={(event) => {
              const value = event.target.value
              void setFilters({ localidad: isLocalityId(value) ? value : null })
            }}
          >
            <option value="">Todas</option>
            {localityIds.map((id) => (
              <option key={id} value={id}>
                {localityLabels[id]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Ramo"
            name="ramo"
            value={filters.ramo ?? ""}
            onChange={(event) => {
              const value = event.target.value
              void setFilters({ ramo: isRamoId(value) ? value : null })
            }}
          >
            <option value="">Todos</option>
            {ramoIds.map((id) => (
              <option key={id} value={id}>
                {ramoLabels[id]}
              </option>
            ))}
          </SelectField>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                void setFilters({ compania: null, localidad: null, ramo: null })
              }}
              className="self-start text-sm font-medium text-teal-deep"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </SurfaceCard>
      <p className="text-[13px] font-light text-body">
        {clients.length === 1 ? "1 cliente" : `${clients.length} clientes`}
      </p>
      {clients.length === 0 ? (
        <SurfaceCard tone="mint">
          <p className="text-sm font-light text-body">
            Ningún cliente coincide con esos filtros.
          </p>
        </SurfaceCard>
      ) : (
        clients.map((client) => {
          const isOpen = openId === client.id

          return (
            <div key={client.id} className="flex flex-col gap-2.5">
              <SurfaceCard onClick={() => toggle(client.id)} expanded={isOpen}>
                <p className="text-base font-medium text-ink">{client.holder}</p>
                <p className="mt-1 text-[13px] font-light text-body">
                  {describePolicies(client.policies)}
                </p>
                <p className="mt-1 text-[13px] font-light text-body">
                  {describePlace(client.policies)}
                </p>
              </SurfaceCard>
              {isOpen ? (
                <SurfaceCard>
                  <p className="text-[11px] font-medium tracking-wide text-muted">
                    PRÓXIMO COBRO
                  </p>
                  <div className="mt-2 flex flex-col gap-4">
                    {client.policies.map((policy) => (
                      <div key={policy.id} className="flex flex-col gap-2.5">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {ramoLabels[policy.ramo]} · {companyLabels[policy.company]}
                          </p>
                          <p className="mt-0.5 text-[13px] font-light text-body">
                            Póliza {policy.policy}
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink">
                            {formatShortDate(policy.nextCharge)}
                          </p>
                        </div>
                        <ShareNotice
                          actionLabel={
                            client.policies.length > 1
                              ? `Enviar póliza de ${ramoLabels[policy.ramo]}`
                              : "Enviar póliza"
                          }
                          message={policyShareMessage(policy)}
                        />
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              ) : null}
            </div>
          )
        })
      )}
    </div>
  )
}

function describePolicies(policies: PortfolioPolicy[]) {
  if (policies.length === 1) {
    const policy = policies[0]
    return `${ramoLabels[policy.ramo]} · ${companyLabels[policy.company]}`
  }

  return joinLabels(policies.map((policy) => ramoLabels[policy.ramo]))
}

function describePlace(policies: PortfolioPolicy[]) {
  const places = [...new Set(policies.map((policy) => localityLabels[policy.locality]))]
  const place = joinLabels(places)

  if (policies.length === 1) return `${place} · Póliza ${policies[0].policy}`
  return `${place} · ${policies.length} pólizas`
}

function joinLabels(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? ""
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`
}
