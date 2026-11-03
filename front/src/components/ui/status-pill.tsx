import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

const tones = {
  listo: { box: "border-[#9dcfb4] text-accent", dot: "bg-accent" },
  cargando: { box: "border-[#e6c27a] text-[#9a6208]", dot: "bg-[#d4a017]" },
  gestion: { box: "border-[#9ec4ee] text-[#1d6fbf]", dot: "bg-[#2f80ed]" },
}

interface StatusPillProps {
  tone: keyof typeof tones
  children: ReactNode
}

export function StatusPill({ tone, children }: StatusPillProps) {
  const style = tones[tone]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-2.5 py-0.5 text-[11px] font-medium",
        style.box,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
      {children}
    </span>
  )
}
