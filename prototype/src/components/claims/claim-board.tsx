"use client"

import { useState } from "react"

import { StatusPill } from "@/components/ui/status-pill"
import { SurfaceCard } from "@/components/ui/surface-card"
import { elapsedDays, formatElapsedDays } from "@/lib/format"
import { claimStatuses, claims } from "@/lib/mock-pas"

export function ClaimBoard() {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <>
      {claims.map((claim) => {
        const isOpen = openId === claim.id
        const status = claimStatuses[claim.status]
        const days = formatElapsedDays(elapsedDays(claim.registeredOn))

        return (
          <div key={claim.id} className="flex flex-col gap-2.5">
            <SurfaceCard
              tone={status.card}
              onClick={() => toggle(claim.id)}
              expanded={isOpen}
            >
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
              <p className="mt-2 text-base font-medium text-ink">{claim.holder}</p>
              <p className="mt-1 text-[13px] font-light text-body">
                {claim.branch} · {claim.company}
              </p>
              <p className="mt-2 text-[13px] font-medium text-ink">{days}</p>
            </SurfaceCard>
            {isOpen ? (
              <SurfaceCard>
                <p className="text-[11px] font-medium tracking-wide text-muted">
                  COMENTARIO
                </p>
                <p className="mt-1 text-[12px] font-light text-muted">
                  Lo declarado por el cliente, cargado por el PAS.
                </p>
                <p className="mt-2 text-sm font-light text-body">{claim.comment}</p>
                <p className="mt-4 text-[11px] font-medium tracking-wide text-muted">
                  CONTACTOS
                </p>
                <div className="mt-2 flex flex-col gap-3">
                  {claim.contacts.map((contact) => (
                    <div key={contact.role}>
                      <p className="text-sm font-medium text-ink">{contact.name}</p>
                      <a
                        href={contact.phoneHref}
                        className="mt-0.5 inline-block text-sm font-light text-teal-deep underline-offset-2 hover:underline"
                      >
                        {contact.phone}
                      </a>
                      <p className="mt-1 text-[12px] font-light text-muted">{contact.role}</p>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            ) : null}
          </div>
        )
      })}
    </>
  )
}
