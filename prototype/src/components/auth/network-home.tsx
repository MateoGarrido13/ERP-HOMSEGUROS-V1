"use client"

import { useSession } from "@/components/auth/session-provider"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { roleLabels } from "@/lib/access"

export function NetworkHome() {
  const { account } = useSession()
  if (!account) return null

  return (
    <ScreenBody>
      <ScreenTitle className="text-[22px]">Red</ScreenTitle>
      <p className="text-sm font-light text-body">
        Inicio de {roleLabels[account.role].long}. Esta sesión alcanza la red de{" "}
        {account.organization}.
      </p>
      <SurfaceCard>
        <p className="text-[11px] font-medium tracking-wide text-muted">ALCANCE</p>
        <p className="mt-2 text-sm font-light text-body">
          {account.name} ve la red, no la cartera de un solo productor.
        </p>
      </SurfaceCard>
    </ScreenBody>
  )
}
