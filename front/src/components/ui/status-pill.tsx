import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

const tones = {
  listo: "bg-[#e5f6ec] text-accent",
  cargando: "bg-[#fff1d6] text-[#9a6208]",
  gestion: "bg-wash text-teal-deep",
}

interface StatusPillProps {
  tone: keyof typeof tones
  children: ReactNode
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
