"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"
import { useState, type FormEvent } from "react"

import { useSession } from "@/components/auth/session-provider"
import { TextLink } from "@/components/auth/text-link"
import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { TextField } from "@/components/ui/text-field"
import { roleLabels, seedAccounts } from "@/lib/access"

export function LoginForm() {
  const router = useRouter()
  const { login } = useSession()
  const [aviso] = useQueryState("aviso")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [formError, setFormError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = login(email, password)
    setEmailError(result.emailError)
    setPasswordError(result.passwordError)
    setFormError(result.formError)
    if (result.home) router.push(result.home)
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <Image
          src="/hom-logo.png"
          alt="HOM, Profesionales en Seguros"
          width={216}
          height={73}
          priority
          className="h-12 w-auto"
        />
        <ScreenTitle className="text-[26px]">Ingresar</ScreenTitle>
        <p className="text-sm font-light text-body">
          La cuenta la da de alta la organización. Desde acá no se registra una nueva.
        </p>
        {aviso === "contrasena" ? (
          <p className="text-sm font-light text-body">
            La contraseña se actualizó. Ingresá con la nueva.
          </p>
        ) : null}
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
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
        />
        {formError ? (
          <p role="alert" className="text-sm text-secondary">
            {formError}
          </p>
        ) : null}
        <BrandButton type="submit">Ingresar</BrandButton>
        <TextLink href="/recuperar">Olvidé mi contraseña</TextLink>
        <SurfaceCard>
          <p className="text-[11px] font-medium tracking-wide text-muted">
            CUENTAS DEL PROTOTIPO
          </p>
          <p className="mt-1 text-[13px] font-light text-body">
            Contraseñas iniciales. Si las cambiaste, este navegador guarda la nueva.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {seedAccounts.map((account) => (
              <li key={account.email} className="text-[13px] font-light text-body">
                <span className="font-medium text-ink">{roleLabels[account.role].short}</span>
                {" · "}
                {account.email}
                <br />
                {account.password}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </ScreenBody>
    </form>
  )
}
