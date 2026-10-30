"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { TextArea, TextField } from "@/components/ui/text-field"
import { withAsegurado, type AseguradoSearch } from "@/lib/asegurado-search"
import { digitsOnly } from "@/lib/format"

interface AseguradoFormProps {
  asegurado: AseguradoSearch
  continueHref: string
}

interface AseguradoErrors {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  dni?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AseguradoForm({ asegurado, continueHref }: AseguradoFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState(asegurado.nombre)
  const [apellido, setApellido] = useState(asegurado.apellido)
  const [email, setEmail] = useState(asegurado.email)
  const [telefono, setTelefono] = useState(asegurado.telefono)
  const [dni, setDni] = useState(asegurado.dni)
  const [comentarios, setComentarios] = useState(asegurado.comentarios)
  const [errors, setErrors] = useState<AseguradoErrors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: AseguradoErrors = {}
    const firstName = nombre.trim()
    const lastName = apellido.trim()
    const mail = email.trim()
    const phone = telefono.trim()
    const identity = dni.trim()
    const phoneDigits = digitsOnly(phone)

    if (firstName.length < 2) nextErrors.nombre = "Ingresá el nombre."
    if (lastName.length < 2) nextErrors.apellido = "Ingresá el apellido."
    if (!emailPattern.test(mail)) nextErrors.email = "Ingresá un email válido."
    if (phoneDigits.length < 8) nextErrors.telefono = "Ingresá el número de teléfono."
    if (identity && !/^\d{7,8}$/.test(identity)) {
      nextErrors.dni = "El DNI tiene 7 u 8 números."
    }

    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      window.document.getElementById(firstError)?.scrollIntoView({ block: "center" })
      return
    }

    router.push(
      withAsegurado(continueHref, {
        nombre: firstName,
        apellido: lastName,
        email: mail,
        telefono: phone,
        dni: identity,
        comentarios: comentarios.trim(),
      }),
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle>Datos del asegurado</ScreenTitle>
        <TextField
          label="Nombre"
          name="nombre"
          autoComplete="given-name"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          error={errors.nombre}
        />
        <TextField
          label="Apellido"
          name="apellido"
          autoComplete="family-name"
          value={apellido}
          onChange={(event) => setApellido(event.target.value)}
          error={errors.apellido}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Ej: cliente@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Número de teléfono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Ej: 11 5555 0000"
          value={telefono}
          onChange={(event) => setTelefono(event.target.value)}
          error={errors.telefono}
        />
        <TextField
          label="DNI"
          name="dni"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          value={dni}
          onChange={(event) => setDni(digitsOnly(event.target.value).slice(0, 8))}
          error={errors.dni}
        />
        <TextArea
          label="Comentarios"
          name="comentarios"
          value={comentarios}
          onChange={(event) => setComentarios(event.target.value)}
        />
        <BrandButton type="submit">Cotizar ahora</BrandButton>
      </ScreenBody>
    </form>
  )
}
