"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { AuthLead, AuthScreen, AuthTitle } from "@/components/auth/auth-screen"
import { useSession } from "@/components/auth/session-provider"
import { BrandButton } from "@/components/ui/brand-button"
import { TextField } from "@/components/ui/text-field"

export function RecoverForm() {
  const router = useRouter()
  const { askRecovery } = useSession()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = askRecovery(email)
    setEmailError(result.emailError ?? undefined)
    if (result.emailError) return
    router.push(`/recuperar/correo?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <form
      method="post"
      action="/recuperar"
      noValidate
      onSubmit={onSubmit}
      className="flex min-h-full flex-1 flex-col"
    >
      <AuthScreen backHref="/">
        <div className="flex flex-col gap-2">
          <AuthTitle>Recuperar contraseña</AuthTitle>
          <AuthLead>
            Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña.
          </AuthLead>
        </div>
        <TextField
          variant="portal"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
        />
        <BrandButton type="submit" variant="portal">
          Enviar enlace
        </BrandButton>
        <Link href="/" className="text-center text-sm font-medium text-portal-deep">
          Volver a iniciar sesión
        </Link>
      </AuthScreen>
    </form>
  )
}
