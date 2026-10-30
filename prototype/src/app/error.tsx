"use client"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ScreenBody>
      <ScreenTitle>No pudimos abrir esta pantalla</ScreenTitle>
      <p className="text-sm font-light text-body">
        Volvé a intentar. Si sigue igual, recargá el prototipo.
      </p>
      <BrandButton onClick={reset}>Reintentar</BrandButton>
    </ScreenBody>
  )
}
