"use client"

import { useState } from "react"

import { LeadBoard } from "@/components/pendientes/lead-board"
import { PendingBoard } from "@/components/pendientes/pending-board"
import { SurfaceCard } from "@/components/ui/surface-card"
import { isoDate } from "@/lib/format"
import { leadCountLabel, type Lead } from "@/lib/leads"
import {
  avisoCountLabel,
  pendingNotices,
  quoteNoticeFromLead,
  whatsappClosesNotice,
  whatsappMarksCobroPendiente,
  whatsappWaitsForClient,
  type PendingNotice,
} from "@/lib/pendientes"

interface PendientesBoardProps {
  initialLeads: Lead[]
}

export function PendientesBoard({ initialLeads }: PendientesBoardProps) {
  const [notices, setNotices] = useState<PendingNotice[]>(() =>
    pendingNotices.map((notice) => ({ ...notice })),
  )
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [openNoticeId, setOpenNoticeId] = useState<string | null>(null)
  const [openLeadId, setOpenLeadId] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  function toggleNotice(id: string) {
    setFlash(null)
    setOpenLeadId(null)
    setOpenNoticeId((current) => (current === id ? null : id))
  }

  function toggleLead(id: string) {
    setFlash(null)
    setOpenNoticeId(null)
    setOpenLeadId((current) => (current === id ? null : id))
  }

  function removeNotice(id: string) {
    setNotices((current) => current.filter((item) => item.id !== id))
    setOpenNoticeId((current) => (current === id ? null : current))
  }

  function waitForClient(id: string) {
    setNotices((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "esperando-respuesta" } : item,
      ),
    )
  }

  function resolveNotice(
    notice: PendingNotice,
    quote?: { next: "alta" | "lead"; comment: string },
  ) {
    if (notice.type === "pago-rechazado" && notice.status === "pendiente") {
      waitForClient(notice.id)
      return
    }

    if (notice.type === "cotizacion-enviada" && quote?.next === "lead") {
      removeNotice(notice.id)
      setFlash("Los leads de automotor salen de las cotizaciones reales de Mercantil Andina.")
      return
    }

    if (notice.type === "cotizacion-enviada" && quote?.next === "alta") {
      removeNotice(notice.id)
      setFlash("El cliente pasó a Cartera.")
      return
    }

    removeNotice(notice.id)
  }

  function markCobroPendiente(id: string) {
    setNotices((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "cobro-pendiente", pill: "cargando" } : item,
      ),
    )
  }

  function shareNotice(notice: PendingNotice) {
    if (!notice.phone) return
    if (whatsappMarksCobroPendiente(notice)) {
      markCobroPendiente(notice.id)
      return
    }
    if (whatsappWaitsForClient(notice)) {
      waitForClient(notice.id)
      return
    }
    if (whatsappClosesNotice(notice)) {
      removeNotice(notice.id)
    }
  }

  function saveDescription(id: string, description: string) {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, description } : lead)),
    )
  }

  function reactivateLead(lead: Lead) {
    const notice = quoteNoticeFromLead({
      leadId: lead.id,
      holder: lead.holder,
      ramo: lead.ramo,
      phone: lead.phone || null,
      quote: lead.proposal
        ? { ...lead.proposal, automotor: lead.automotor }
        : undefined,
      dueOn: isoDate(),
    })
    setNotices((current) => [notice, ...current])
    setOpenLeadId(null)
    setOpenNoticeId(notice.id)
    setFlash(null)
  }

  async function discardLead(id: string) {
    const response = await fetch(`/api/cotizaciones/automotor/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "discarded" }),
    })
    if (!response.ok) {
      setFlash("No se pudo descartar el lead.")
      return
    }
    setLeads((current) => current.filter((item) => item.id !== id))
    setOpenLeadId(null)
  }

  return (
    <>
      {flash ? (
        <SurfaceCard tone="ok">
          <p className="text-sm font-light text-body">{flash}</p>
        </SurfaceCard>
      ) : null}
      <p className="text-[13px] font-light text-body">{avisoCountLabel(notices.length)}</p>
      <PendingBoard
        notices={notices}
        openId={openNoticeId}
        onToggle={toggleNotice}
        onResolve={resolveNotice}
        onWhatsapp={shareNotice}
      />
      <section className="mt-4 flex flex-col gap-2.5">
        <h2 className="font-sans text-[22px] leading-tight font-semibold tracking-tight text-title">
          Leads
        </h2>
        <p className="text-[13px] font-light text-body">{leadCountLabel(leads.length)}</p>
        <LeadBoard
          leads={leads}
          openId={openLeadId}
          onToggle={toggleLead}
          onSaveDescription={saveDescription}
          onReactivate={reactivateLead}
          onDiscard={discardLead}
        />
      </section>
    </>
  )
}
