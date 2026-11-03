"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"
import { useState, type FormEvent } from "react"

import { AuthAlert, AuthLead, AuthScreen, AuthTitle } from "@/components/auth/auth-screen"
import { useSession } from "@/components/auth/session-provider"
import { BrandButton } from "@/components/ui/brand-button"
import { TextField } from "@/components/ui/text-field"

export function ResetPasswordForm() {
  const router = useRouter()
  const { saveNewPassword } = useSession()
  const [token] = useQueryState("token")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [passwordError, setPasswordError] = useState<string>()
  const [confirmError, setConfirmError] = useState<string>()
  const [formError, setFormError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = saveNewPassword(token ?? "", password, confirm)
    setPasswordError(result.passwordError)
    setConfirmError(result.confirmError)
    setFormError(result.formError)
    if (result.ok) router.push("/?aviso=contrasena")
  }

  return (
    <form
      method="post"
      action="/recuperar/nueva"
      noValidate
      onSubmit={onSubmit}
      className="flex min-h-full flex-1 flex-col"
    >
      <AuthScreen backHref="/recuperar/correo">
        <div className="flex flex-col gap-2">
          <AuthTitle>Crear nueva contraseña</AuthTitle>
          <AuthLead>Elegí una contraseña que no hayas usado antes.</AuthLead>
        </div>
        {formError ? <AuthAlert>{formError}</AuthAlert> : null}
        <TextField
          variant="portal"
          label="Nueva contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
          hint="Mínimo 8 caracteres"
        />
        <TextField
          variant="portal"
          label="Confirmar contraseña"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={confirmError}
        />
        <BrandButton type="submit" variant="portal">
          Guardar contraseña
        </BrandButton>
        <Link href="/" className="text-center text-sm font-medium text-portal-deep">
          Cancelar
        </Link>
      </AuthScreen>
    </form>
  )
}
