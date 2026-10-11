"use client"

import { useState } from "react"

import { useSignedName } from "@/components/auth/signed-identity"
import { ShareNotice } from "@/components/collections/share-notice"
import { SurfaceCard } from "@/components/ui/surface-card"
import { cn } from "@/lib/cn"
import { collections, personalizeName } from "@/lib/mock-pas"

export function CollectionBoard() {
  const name = useSignedName()
  const [openIds, setOpenIds] = useState<string[]>([])

  function toggle(id: string) {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((openId) => openId !== id)
        : [...current, id],
    )
  }

  return (
    <>
      {collections.map((item) => {
        const isOpen = openIds.includes(item.id)

        return (
          <div key={item.id} className="flex flex-col gap-2.5">
            <SurfaceCard
              tone={item.tone}
              onClick={() => toggle(item.id)}
              expanded={isOpen}
            >
              <p
                className={cn(
                  "text-[11px] font-medium tracking-wide",
                  item.tone === "alert" ? "text-[#9a6208]" : "text-accent",
                )}
              >
                {item.label}
              </p>
              <p className="mt-1 text-base font-medium text-ink">{item.title}</p>
              <p className="mt-2 text-[13px] font-light text-body">{item.detail}</p>
              {item.note ? (
                <p className="mt-1 text-[13px] font-light text-body">{item.note}</p>
              ) : null}
            </SurfaceCard>
            {isOpen ? (
              <ShareNotice
                actionLabel={item.actionLabel}
                message={personalizeName(item.message, name)}
              />
            ) : null}
          </div>
        )
      })}
    </>
  )
}
