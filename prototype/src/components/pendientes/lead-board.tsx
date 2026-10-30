"use client"

import { useState } from "react"

import {
  CancelButton,
  ConfirmCard,
  DetailField,
  TextAction,
} from "@/components/pendientes/confirm-card"
import { BrandButton, BrandButtonLink } from "@/components/ui/brand-button"
import { SurfaceCard } from "@/components/ui/surface-card"
import { TextArea } from "@/components/ui/text-field"
import { elapsedDays, formatElapsedDays, formatShortDate } from "@/lib/format"
import { leadQuoteHref, type Lead } from "@/lib/leads"

interface LeadBoardProps {
  leads: Lead[]
  openId: string | null
  onToggle: (id: string) => void
  onSaveDescription: (id: string, description: string) => void
  onReactivate: (lead: Lead) => void
  onDiscard: (id: string) => void
}

type LeadAction = "idle" | "edit" | "reactivate" | "discard"

export function LeadBoard({
  leads,
  openId,
  onToggle,
  onSaveDescription,
  onReactivate,
  onDiscard,
}: LeadBoardProps) {
  if (leads.length === 0) return null

  return (
    <>
      {leads.map((lead) => {
        const isOpen = openId === lead.id
        const days = formatElapsedDays(elapsedDays(lead.updatedOn))

        return (
          <div key={lead.id} className="flex flex-col gap-2.5">
            <SurfaceCard onClick={() => onToggle(lead.id)} expanded={isOpen}>
              <p className="text-[11px] font-medium tracking-wide text-muted">
                {lead.origin.toUpperCase()}
              </p>
              <p className="mt-2 text-base font-medium text-ink">{lead.holder}</p>
              <p className="mt-1 text-[13px] font-light text-body">{lead.ramo}</p>
              <p className="mt-3 text-[11px] font-medium tracking-wide text-muted">
                ULT. FECHA DE MODIFICACIÓN
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {formatShortDate(lead.updatedOn)}
              </p>
              <p className="mt-1 text-[13px] font-medium text-ink">{days}</p>
            </SurfaceCard>
            {isOpen ? (
              <LeadDetail
                key={lead.id}
                lead={lead}
                onSaveDescription={onSaveDescription}
                onReactivate={() => onReactivate(lead)}
                onDiscard={() => onDiscard(lead.id)}
              />
            ) : null}
          </div>
        )
      })}
    </>
  )
}

interface LeadDetailProps {
  lead: Lead
  onSaveDescription: (id: string, description: string) => void
  onReactivate: () => void
  onDiscard: () => void
}

function LeadDetail({
  lead,
  onSaveDescription,
  onReactivate,
  onDiscard,
}: LeadDetailProps) {
  const [action, setAction] = useState<LeadAction>("idle")
  const [draft, setDraft] = useState(lead.description)

  function cancel() {
    setAction("idle")
    setDraft(lead.description)
  }

  if (action === "edit") {
    return (
      <SurfaceCard>
        <TextArea
          label="Descripción"
          name={`descripcion-${lead.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <BrandButton
          type="button"
          className="mt-3"
          onClick={() => {
            onSaveDescription(lead.id, draft)
            setAction("idle")
          }}
        >
          Guardar
        </BrandButton>
        <CancelButton onClick={cancel} />
      </SurfaceCard>
    )
  }

  if (action === "reactivate" && lead.proposal) {
    return (
      <ConfirmCard
        title="¿Pasás este lead a Pendientes como Cotización enviada?"
        confirmLabel="Confirmar"
        onConfirm={onReactivate}
        onCancel={cancel}
        tone="mint"
      >
        <DetailField label="PROPUESTA ENVIADA">
          <p className="font-medium text-ink">
            {lead.proposal.coverage} · {lead.proposal.company}
          </p>
          <p className="mt-1">{lead.proposal.good}</p>
          <p className="mt-1">{lead.proposal.premium} por mes</p>
        </DetailField>
      </ConfirmCard>
    )
  }

  if (action === "discard") {
    return (
      <ConfirmCard
        title="¿Descartás este lead? El cliente sigue en la base."
        confirmLabel="Descartar"
        onConfirm={onDiscard}
        onCancel={cancel}
      />
    )
  }

  return (
    <SurfaceCard>
      <DetailField label="DESCRIPCIÓN">{lead.description}</DetailField>
      {lead.phone ? (
        <div className="mt-4">
          <p className="text-[11px] font-medium tracking-wide text-muted">TELÉFONO</p>
          <a
            href={lead.phoneHref}
            className="mt-1 inline-block text-sm font-light text-teal-deep underline-offset-2 hover:underline"
          >
            {lead.phone}
          </a>
        </div>
      ) : null}
      <div className="mt-4 flex flex-col gap-2.5">
        <TextAction
          onClick={() => {
            setDraft(lead.description)
            setAction("edit")
          }}
        >
          Editar
        </TextAction>
        <BrandButtonLink href={leadQuoteHref(lead)}>Enviar cotización</BrandButtonLink>
        {lead.proposal ? (
          <BrandButton type="button" onClick={() => setAction("reactivate")}>
            Reactivar
          </BrandButton>
        ) : null}
        <button
          type="button"
          onClick={() => setAction("discard")}
          className="text-center text-sm font-medium text-secondary"
        >
          Descartar
        </button>
      </div>
    </SurfaceCard>
  )
}
