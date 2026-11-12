import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

const tones = {
  plain: "border-line bg-white",
  mint: "border-[#b7e0dc] bg-mint",
  alert: "border-[#f0c36a] bg-white",
  ok: "border-[#9dcfb4] bg-white",
}

interface SurfaceCardProps {
  children: ReactNode
  tone?: keyof typeof tones
  className?: string
  onClick?: () => void
  expanded?: boolean
}

export function SurfaceCard({
  children,
  tone = "plain",
  className,
  onClick,
  expanded,
}: SurfaceCardProps) {
  const classes = cn(
    "w-full rounded-xl border p-4",
    tones[tone],
    onClick && "cursor-pointer text-left",
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        className={classes}
      >
        {children}
      </button>
    )
  }

  return <article className={classes}>{children}</article>
}
