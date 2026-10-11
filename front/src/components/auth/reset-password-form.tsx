"use client"

import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"
import { useState, type FormEvent } from "react"

import { useSession } from "@/components/auth/session-provider"
import { TextLink } from "@/components/auth/text-link"
import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { TextField } from "@/components/ui/text-field"
import { passwordPolicyHint } from "@/lib/access"

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
    <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle className="text-[26px]">Contraseña nueva</ScreenTitle>
        <p className="text-sm font-light text-body">{passwordPolicyHint}</p>
        {formError ? (
          <p role="alert" className="text-sm text-secondary">
            {formError}
          </p>
        ) : null}
        <TextField
          label="Contraseña nueva"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
        />
        <TextField
          label="Confirmación"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={confirmError}
        />
        <BrandButton type="submit">Guardar</BrandButton>
        <TextLink href="/recuperar">Pedir un enlace nuevo</TextLink>
      </ScreenBody>
    </form>
  )
}
