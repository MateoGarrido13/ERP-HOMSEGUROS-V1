"use client"

import Link from "next/link"
import { useQueryState } from "nuqs"
import { useState } from "react"

import { AuthLead, AuthScreen, AuthTitle } from "@/components/auth/auth-screen"
import { useSession } from "@/components/auth/session-provider"
import { BrandButtonLink } from "@/components/ui/brand-button"

export function MailInbox() {
  const { recovery, askRecovery } = useSession()
  const [email] = useQueryState("email")
  const [resent, setResent] = useState(false)
  const address = email?.trim() || recovery?.email || ""
  const canOpen = recovery !== null && !recovery.used && (!email || recovery.email === email.trim().toLowerCase())

  function resend() {
    if (!address) return
    askRecovery(address)
    setResent(true)
  }

  return (
    <AuthScreen backHref="/recuperar">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-mint text-portal-deep">
        <MailIcon />
      </div>
      <div className="flex flex-col gap-2">
        <AuthTitle>Revisá tu correo</AuthTitle>
        <AuthLead>
          Te enviamos un enlace para restablecer tu contraseña. Vence en 30 minutos.
        </AuthLead>
      </div>
      <BrandButtonLink href="/" variant="outline">
        Volver a iniciar sesión
      </BrandButtonLink>
      <p className="text-center text-sm text-slate">
        ¿No lo recibiste?{" "}
        {address ? (
          <button type="button" onClick={resend} className="text-link underline underline-offset-2">
            Reenviar enlace
          </button>
        ) : (
          <Link href="/recuperar" className="text-link underline underline-offset-2">
            Reenviar enlace
          </Link>
        )}
      </p>
      {resent ? (
        <p role="status" className="text-center text-xs text-hint">
          Si el correo está registrado, el enlace vuelve a salir.
        </p>
      ) : null}
      {canOpen ? (
        <p className="text-center text-xs text-hint">
          En este prototipo el correo no sale.{" "}
          <Link
            href={`/recuperar/nueva?token=${encodeURIComponent(recovery.token)}`}
            className="text-link underline underline-offset-2"
          >
            Abrí el enlace
          </Link>
        </p>
      ) : null}
    </AuthScreen>
  )
}

function MailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <rect
        x="4"
        y="7"
        width="20"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 8.5 14 15l9-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
