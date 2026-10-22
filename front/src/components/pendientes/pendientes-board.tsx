"use client"

import { useState } from "react"

import { LeadBoard } from "@/components/pendientes/lead-board"
import { PendingBoard } from "@/components/pendientes/pending-board"
import { SurfaceCard } from "@/components/ui/surface-card"
import { isoDate } from "@/lib/format"
import { leadCountLabel, leads as seedLeads, rejectedQuoteLead, type Lead } from "@/lib/leads"
import {
  avisoCountLabel,
  pendingNotices,
  quoteNoticeFromLead,
  whatsappClosesNotice,
  whatsappWaitsForClient,
  type PendingNotice,
} from "@/lib/pendientes"

export function PendientesBoard() {
  const [notices, setNotices] = useState<PendingNotice[]>(() =>
    pendingNotices.map((notice) => ({ ...notice })),
  )
  const [leads, setLeads] = useState<Lead[]>(() => seedLeads.map((lead) => ({ ...lead })))
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
      const lead = rejectedQuoteLead({
        noticeId: notice.id,
        holder: notice.holder,
        ramo: notice.coverage,
        phone: notice.phone,
        quote: notice.quote,
        comment: quote.comment,
        updatedOn: isoDate(),
      })
      setLeads((current) => [lead, ...current])
      removeNotice(notice.id)
      setOpenLeadId(lead.id)
      setFlash(null)
      return
    }

    if (notice.type === "cotizacion-enviada" && quote?.next === "alta") {
      removeNotice(notice.id)
      setFlash("El cliente pasó a Cartera.")
      return
    }

    removeNotice(notice.id)
  }

  function shareNotice(notice: PendingNotice) {
    if (!notice.phone) return
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
      quote: lead.proposal,
      dueOn: isoDate(),
    })
    setLeads((current) => current.filter((item) => item.id !== lead.id))
    setNotices((current) => [notice, ...current])
    setOpenLeadId(null)
    setOpenNoticeId(notice.id)
    setFlash(null)
  }

  function discardLead(id: string) {
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
        <h2 className="font-display text-[22px] leading-normal font-bold text-black">Leads</h2>
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
