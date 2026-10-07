"use client"

import { useState } from "react"

import { ShareNotice } from "@/components/collections/share-notice"
import { StatusPill } from "@/components/ui/status-pill"
import { SurfaceCard } from "@/components/ui/surface-card"
import { pendingNotices, pendingWhatsappLabel } from "@/lib/pendientes"

export function PendingBoard() {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <>
      {pendingNotices.map((notice) => {
        const isOpen = openId === notice.id

        return (
          <div key={notice.id} className="flex flex-col gap-2.5">
            <SurfaceCard
              tone={notice.tone}
              onClick={() => toggle(notice.id)}
              expanded={isOpen}
            >
              <StatusPill tone={notice.pill}>{notice.label}</StatusPill>
              <p className="mt-2 text-base font-medium text-ink">{notice.holder}</p>
              <p className="mt-1 text-[13px] font-light text-body">{notice.summary}</p>
            </SurfaceCard>
            {isOpen ? (
              <SurfaceCard>
                <p className="text-[11px] font-medium tracking-wide text-muted">
                  COMENTARIO
                </p>
                <p className="mt-2 text-sm font-light text-body">{notice.comment}</p>
                {notice.details.map((detail) => (
                  <div key={detail.label} className="mt-4">
                    <p className="text-[11px] font-medium tracking-wide text-muted">
                      {detail.label.toUpperCase()}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                      {detail.lines.map((line) => (
                        <p key={line} className="text-sm font-light text-body">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <ShareNotice
                    actionLabel={pendingWhatsappLabel}
                    message={notice.message}
                  />
                </div>
              </SurfaceCard>
            ) : null}
          </div>
        )
      })}
    </>
  )
}
