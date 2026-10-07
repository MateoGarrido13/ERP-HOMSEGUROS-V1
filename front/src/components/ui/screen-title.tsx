import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

interface ScreenTitleProps {
  children: ReactNode
  size?: "display" | "document"
  className?: string
}

export function ScreenTitle({
  children,
  size = "display",
  className,
}: ScreenTitleProps) {
  if (size === "document") {
    return (
      <h1 className={cn("font-sans text-lg font-bold text-ink", className)}>
        {children}
      </h1>
    )
  }

  return (
    <h1
      className={cn(
        "font-display text-[26px] leading-normal font-bold text-black",
        className,
      )}
    >
      {children}
    </h1>
  )
}
