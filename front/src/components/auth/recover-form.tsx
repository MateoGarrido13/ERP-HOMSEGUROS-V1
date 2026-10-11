"use client"

import { useQueryState } from "nuqs"
import { useState, type FormEvent } from "react"

import { useSession } from "@/components/auth/session-provider"
import { TextLink } from "@/components/auth/text-link"
import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { TextField } from "@/components/ui/text-field"
import { recoveryNotice } from "@/lib/access"

export function RecoverForm() {
  const { askRecovery } = useSession()
  const [enviado, setEnviado] = useQueryState("enviado")
  const [notice, setNotice] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = askRecovery(email)
    setEmailError(result.emailError ?? undefined)
    if (result.emailError) return
    setNotice(result.notice)
    void setEnviado("1")
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle className="text-[26px]">Olvidé mi contraseña</ScreenTitle>
        <p className="text-sm font-light text-body">
          Ingresá el email de la cuenta. El aviso es el mismo si el email no está registrado.
        </p>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
        />
        {enviado === "1" ? (
          <p role="status" className="text-sm font-light text-body">
            {notice || recoveryNotice}
          </p>
        ) : null}
        <BrandButton type="submit">Enviar</BrandButton>
        {enviado === "1" ? <TextLink href="/recuperar/correo">Abrir el correo</TextLink> : null}
        <TextLink href="/">Volver al ingreso</TextLink>
      </ScreenBody>
    </form>
  )
}
