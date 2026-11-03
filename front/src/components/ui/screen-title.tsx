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
      <h1 className={cn("font-sans text-lg font-semibold text-title", className)}>
        {children}
      </h1>
    )
  }

  return (
    <h1
      className={cn(
        "font-sans text-[22px] leading-tight font-semibold tracking-tight text-title",
        className,
      )}
    >
      {children}
    </h1>
  )
}
