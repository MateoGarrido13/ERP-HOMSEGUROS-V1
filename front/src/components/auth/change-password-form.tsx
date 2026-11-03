"use client"

import { useState, type FormEvent } from "react"

import { useSession } from "@/components/auth/session-provider"
import { TextLink } from "@/components/auth/text-link"
import { BrandButton, BrandButtonLink } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { TextField } from "@/components/ui/text-field"
import { passwordPolicyHint } from "@/lib/access"

export function ChangePasswordForm() {
  const { replacePassword } = useSession()
  const [current, setCurrent] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [currentError, setCurrentError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [confirmError, setConfirmError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [saved, setSaved] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = replacePassword(current, password, confirm)
    setCurrentError(result.currentError)
    setPasswordError(result.passwordError)
    setConfirmError(result.confirmError)
    setFormError(result.formError)
    if (result.ok) setSaved(true)
  }

  if (saved) {
    return (
      <ScreenBody>
        <ScreenTitle className="text-[26px]">Contraseña actualizada</ScreenTitle>
        <p className="text-sm font-light text-body">
          La anterior ya no sirve para ingresar. Esta sesión sigue abierta.
        </p>
        <BrandButtonLink href="/perfil">Volver al perfil</BrandButtonLink>
      </ScreenBody>
    )
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle className="text-[26px]">Cambiar contraseña</ScreenTitle>
        <p className="text-sm font-light text-body">{passwordPolicyHint}</p>
        {formError ? (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <TextField
          label="Contraseña actual"
          name="current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          error={currentError}
        />
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
        <TextLink href="/perfil">Volver al perfil</TextLink>
      </ScreenBody>
    </form>
  )
}
