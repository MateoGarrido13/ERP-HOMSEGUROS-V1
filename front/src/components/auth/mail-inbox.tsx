"use client"

import { useSession } from "@/components/auth/session-provider"
import { TextLink } from "@/components/auth/text-link"
import { BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"

export function MailInbox() {
  const { recovery } = useSession()
  const canOpen = recovery !== null && !recovery.used

  return (
    <ScreenBody>
      <ScreenTitle className="text-[26px]">Correo</ScreenTitle>
      <p className="text-sm font-light text-body">
        Bandeja de este prototipo. El enlace no muestra la contraseña.
      </p>
      {canOpen ? (
        <SurfaceCard>
          <p className="text-[11px] font-medium tracking-wide text-muted">HOM</p>
          <p className="mt-2 text-base font-medium text-ink">Elegí una contraseña nueva</p>
          <p className="mt-2 text-sm font-light text-body">
            Para {recovery.email}. El enlace es de un solo uso y vence.
          </p>
          <BrandButtonLink
            href={`/recuperar/nueva?token=${encodeURIComponent(recovery.token)}`}
            className="mt-4"
          >
            Elegir una contraseña nueva
          </BrandButtonLink>
        </SurfaceCard>
      ) : (
        <SurfaceCard>
          <p className="text-sm font-light text-body">
            {recovery?.used
              ? "Este mensaje ya se usó. Pedí un enlace nuevo."
              : "No hay mensajes nuevos."}
          </p>
        </SurfaceCard>
      )}
      <TextLink href="/recuperar">Pedir un enlace</TextLink>
      <TextLink href="/">Volver al ingreso</TextLink>
    </ScreenBody>
  )
}
