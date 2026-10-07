"use client"

import { useState } from "react"

import { SurfaceCard } from "@/components/ui/surface-card"
import { elapsedDays, formatElapsedDays, formatShortDate } from "@/lib/format"
import { leads } from "@/lib/leads"

export function LeadBoard() {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <>
      {leads.map((lead) => {
        const isOpen = openId === lead.id
        const days = formatElapsedDays(elapsedDays(lead.updatedOn))

        return (
          <div key={lead.id} className="flex flex-col gap-2.5">
            <SurfaceCard onClick={() => toggle(lead.id)} expanded={isOpen}>
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
              <SurfaceCard>
                <p className="text-[11px] font-medium tracking-wide text-muted">
                  COMENTARIO
                </p>
                <p className="mt-2 text-sm font-light text-body">{lead.comment}</p>
                <p className="mt-4 text-[11px] font-medium tracking-wide text-muted">
                  TELÉFONO
                </p>
                <a
                  href={lead.phoneHref}
                  className="mt-1 inline-block text-sm font-light text-teal-deep underline-offset-2 hover:underline"
                >
                  {lead.phone}
                </a>
              </SurfaceCard>
            ) : null}
          </div>
        )
      })}
    </>
  )
}
