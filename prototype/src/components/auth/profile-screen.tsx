"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { useSession } from "@/components/auth/session-provider"
import { TextLink } from "@/components/auth/text-link"
import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { SurfaceCard } from "@/components/ui/surface-card"
import { TextField } from "@/components/ui/text-field"
import { roleLabels } from "@/lib/access"

export function ProfileScreen() {
  const router = useRouter()
  const { account, saveProfile, logout } = useSession()
  const [editing, setEditing] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [name, setName] = useState(account?.name ?? "")
  const [phone, setPhone] = useState(account?.phone ?? "")
  const [nameError, setNameError] = useState<string>()
  const [phoneError, setPhoneError] = useState<string>()

  if (!account) return null

  function startEdit() {
    if (!account) return
    setName(account.name)
    setPhone(account.phone)
    setNameError(undefined)
    setPhoneError(undefined)
    setConfirmingLogout(false)
    setEditing(true)
  }

  function cancelEdit() {
    setNameError(undefined)
    setPhoneError(undefined)
    setEditing(false)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = saveProfile(name, phone)
    setNameError(result.nameError)
    setPhoneError(result.phoneError)
    if (result.ok) setEditing(false)
  }

  function confirmLogout() {
    logout()
    router.replace("/")
  }

  const rows = [
    { label: "Rol", value: roleLabels[account.role].long },
    { label: "Matrícula", value: account.license || "—" },
    { label: "Organización", value: account.organization },
  ]

  return (
    <ScreenBody>
      <ScreenTitle className="text-[22px]">{account.name}</ScreenTitle>
      {editing ? (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <TextField
            label="Nombre"
            name="nombre"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={nameError}
          />
          <TextField
            label="Teléfono"
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={phoneError}
          />
          <SurfaceCard>
            <dl className="flex flex-col gap-3">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[11px] font-medium tracking-wide text-muted">
                    {row.label.toUpperCase()}
                  </dt>
                  <dd className="mt-1 text-sm font-light text-body">{row.value}</dd>
                </div>
              ))}
            </dl>
          </SurfaceCard>
          <BrandButton type="submit">Guardar</BrandButton>
          <button
            type="button"
            onClick={cancelEdit}
            className="text-center text-sm font-medium text-secondary"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <>
          <SurfaceCard>
            <dl className="flex flex-col gap-3">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[11px] font-medium tracking-wide text-muted">
                    {row.label.toUpperCase()}
                  </dt>
                  <dd className="mt-1 text-sm font-light text-body">{row.value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[11px] font-medium tracking-wide text-muted">TELÉFONO</dt>
                <dd className="mt-1 text-sm font-light text-body">{account.phone}</dd>
              </div>
            </dl>
          </SurfaceCard>
          <BrandButton type="button" onClick={startEdit}>
            Editar
          </BrandButton>
          <TextLink href="/perfil/contrasena">Cambiar contraseña</TextLink>
          {confirmingLogout ? (
            <SurfaceCard tone="alert">
              <p className="text-sm font-medium text-ink">
                ¿Cerrar la sesión en este dispositivo?
              </p>
              <BrandButton type="button" className="mt-3" onClick={confirmLogout}>
                Cerrar sesión
              </BrandButton>
              <button
                type="button"
                onClick={() => setConfirmingLogout(false)}
                className="mt-3 w-full text-center text-sm font-medium text-secondary"
              >
                Cancelar
              </button>
            </SurfaceCard>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              className="text-center text-sm font-medium text-secondary"
            >
              Cerrar sesión
            </button>
          )}
        </>
      )}
    </ScreenBody>
  )
}
