import type { ReactNode } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { SurfaceCard } from "@/components/ui/surface-card"

interface ConfirmCardProps {
  title: string
  children?: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  tone?: "alert" | "plain" | "mint"
}

export function ConfirmCard({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  tone = "alert",
}: ConfirmCardProps) {
  return (
    <SurfaceCard tone={tone}>
      <p className="text-sm font-medium text-ink">{title}</p>
      {children ? <div className="mt-3 flex flex-col gap-3">{children}</div> : null}
      <BrandButton type="button" className="mt-3" onClick={onConfirm}>
        {confirmLabel}
      </BrandButton>
      <CancelButton onClick={onCancel} />
    </SurfaceCard>
  )
}

export function CancelButton({
  onClick,
  children = "Cancelar",
}: {
  onClick: () => void
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 w-full text-center text-sm font-medium text-secondary"
    >
      {children}
    </button>
  )
}

export function TextAction({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-center text-sm font-medium text-teal-deep"
    >
      {children}
    </button>
  )
}

export function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-muted">{label}</p>
      <div className="mt-1 text-sm font-light text-body">{children}</div>
    </div>
  )
}
