"use client"

import { useState } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { SurfaceCard } from "@/components/ui/surface-card"

interface ShareNoticeProps {
  actionLabel: string
  message: string
}

export function ShareNotice({ actionLabel, message }: ShareNoticeProps) {
  const [isOpen, setIsOpen] = useState(false)

  async function onShare() {
    setIsOpen(true)

    if (typeof navigator === "undefined" || !navigator.share) return

    try {
      await navigator.share({
        title: "HOM Seguros",
        text: message,
      })
    } catch {
      setIsOpen(true)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {isOpen ? (
        <SurfaceCard tone="ok">
          <p className="text-[11px] font-medium tracking-wide text-accent">
            LISTO PARA WHATSAPP
          </p>
          <p className="mt-2 text-sm font-light text-body">{message}</p>
        </SurfaceCard>
      ) : null}
      <BrandButton variant="whatsapp" onClick={onShare}>
        {actionLabel}
      </BrandButton>
    </div>
  )
}
