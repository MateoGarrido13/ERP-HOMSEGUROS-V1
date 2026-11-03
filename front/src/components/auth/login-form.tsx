"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"
import { useState, type FormEvent } from "react"

import { AuthAlert, AuthLead, AuthScreen, AuthTitle } from "@/components/auth/auth-screen"
import { useSession } from "@/components/auth/session-provider"
import { BrandButton } from "@/components/ui/brand-button"
import { TextField } from "@/components/ui/text-field"

const exampleAccount = {
  email: "garridomateo09@gmail.com",
  password: "123",
}

export function LoginForm() {
  const router = useRouter()
  const { login } = useSession()
  const [aviso] = useQueryState("aviso")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    try {
      const result = await login(email, password, remember)
      setEmailError(result.emailError)
      setPasswordError(result.passwordError)
      setFormError(result.formError)
      if (result.home) router.push(result.home)
    } finally {
      setPending(false)
    }
  }

  return (
    <form method="post" action="/" noValidate onSubmit={onSubmit} className="flex min-h-full flex-1 flex-col">
      <AuthScreen>
        <div className="flex flex-col gap-2">
          <AuthTitle>Iniciar sesión</AuthTitle>
          <AuthLead>Ingresá a Portal PAS con tu email y contraseña.</AuthLead>
        </div>
        {aviso === "contrasena" ? (
          <p className="rounded-xl border border-[#9dcfb4] bg-white px-3 py-2.5 text-center text-sm text-accent">
            La contraseña se actualizó. Ingresá con la nueva.
          </p>
        ) : null}
        {formError ? <AuthAlert>{formError}</AuthAlert> : null}
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
        <TextField
          variant="portal"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 rounded border-field accent-primary"
            />
            Recordarme
          </label>
          <Link href="/recuperar" className="text-link underline underline-offset-2">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <BrandButton type="submit" variant="portal" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </BrandButton>
        <details className="text-xs text-hint">
          <summary className="cursor-pointer text-center">Usuario de ejemplo</summary>
          <p className="mt-3 text-left">
            {exampleAccount.email}
            <br />
            {exampleAccount.password}
          </p>
        </details>
      </AuthScreen>
    </form>
  )
}
