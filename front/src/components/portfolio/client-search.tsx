"use client"

import { useState } from "react"
import { useQueryStates } from "nuqs"

import { useSignedName } from "@/components/auth/signed-identity"
import { ShareNotice } from "@/components/collections/share-notice"
import { SurfaceCard } from "@/components/ui/surface-card"
import { SelectField, TextField } from "@/components/ui/text-field"
import { BrandButton } from "@/components/ui/brand-button"
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
  type PolicyAdministrator,
  type PortfolioPolicy,
} from "@/lib/portfolio"
import { personalizeName } from "@/lib/mock-pas"
import { companyIds } from "@/lib/quote-search"

export function ClientSearch() {
  const name = useSignedName()
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
                          {policy.building ? (
                            <ConsorcioDetail policy={policy} />
                          ) : (
                            <p className="mt-1 text-sm font-medium text-ink">
                              {formatShortDate(policy.nextCharge)}
                            </p>
                          )}
                        </div>
                        {policy.ramo === "consorcio" ? (
                          <p className="text-[13px] font-light text-body">
                            El cupón del próximo cobro se envía al administrador desde Pendientes.
                          </p>
                        ) : (
                          <ShareNotice
                            actionLabel={
                              client.policies.length > 1
                                ? `Enviar póliza de ${ramoLabels[policy.ramo]}`
                                : "Enviar póliza"
                            }
                            message={personalizeName(policyShareMessage(policy), name)}
                          />
                        )}
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

function ConsorcioDetail({ policy }: { policy: PortfolioPolicy }) {
  return (
    <div className="mt-3 flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-medium tracking-wide text-muted">EDIFICIO</p>
        <p className="mt-1 text-sm font-medium text-ink">{policy.building}</p>
      </div>
      <div>
        <p className="text-[11px] font-medium tracking-wide text-muted">VIGENCIA ANUAL</p>
        <p className="mt-1 text-sm font-medium text-ink">
          {formatShortDate(policy.vigenciaFrom ?? "")} – {formatShortDate(policy.vigenciaTo ?? "")}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-medium tracking-wide text-muted">RENOVACIÓN MENSUAL</p>
        <p className="mt-1 text-sm font-medium text-ink">
          Próximo cobro {formatShortDate(policy.nextCharge)}
        </p>
      </div>
      <AdministratorContact contact={policy.administrator} />
    </div>
  )
}

function AdministratorContact({ contact }: { contact?: PolicyAdministrator }) {
  const [name, setName] = useState(contact?.name ?? "")
  const [phone, setPhone] = useState(contact?.phone ?? "")
  const [saved, setSaved] = useState(Boolean(contact?.name && contact.phone))
  const [error, setError] = useState<string>()

  function save() {
    if (!name.trim() || !phone.trim()) {
      setSaved(false)
      setError("Completá el nombre y el teléfono del administrador.")
      return
    }
    setError(undefined)
    setSaved(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Administrador"
        name="administrador"
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setSaved(false)
        }}
        error={error}
      />
      <TextField
        label="Teléfono del administrador"
        name="telefono-administrador"
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value)
          setSaved(false)
        }}
      />
      <BrandButton type="button" onClick={save}>
        {contact ? "Guardar contacto" : "Agregar contacto"}
      </BrandButton>
      {saved ? (
        <p className="text-[13px] font-light text-body">
          Contacto del administrador guardado en esta póliza.
        </p>
      ) : null}
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
  if (policies.length === 1 && policies[0].building) {
    return `${policies[0].building} · Póliza ${policies[0].policy}`
  }

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
