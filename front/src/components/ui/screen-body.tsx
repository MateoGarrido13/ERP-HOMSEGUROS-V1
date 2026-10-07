import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

interface ScreenBodyProps {
  children: ReactNode
  className?: string
}

export function ScreenBody({ children, className }: ScreenBodyProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-3.5 px-5 pt-4 pb-3", className)}>
      {children}
    </div>
  )
}
