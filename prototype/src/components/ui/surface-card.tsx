import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

const tones = {
  plain: "border-line bg-white",
  mint: "border-[#b7e4e2] bg-wash",
  alert: "border-[#f3d7a1] bg-[#fff8ee]",
  ok: "border-[#b7e3c8] bg-[#f4fbf7]",
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
    "w-full rounded-[6px] border p-4",
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
