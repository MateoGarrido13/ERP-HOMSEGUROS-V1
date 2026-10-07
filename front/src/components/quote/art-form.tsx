"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"

import { BrandButton } from "@/components/ui/brand-button"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { TextField } from "@/components/ui/text-field"
import { artHref, formatCuit, type ArtSearch } from "@/lib/art-search"
import { digitsOnly, formatPesos } from "@/lib/format"

interface ArtFormProps {
  art: ArtSearch
}

interface ArtErrors {
  empresa?: string
  cuit?: string
  actividad?: string
  empleados?: string
  masa?: string
  archivo?: string
  cargo?: string
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 border-t border-line pt-3.5">
      <h2 className="text-sm font-medium text-teal-deep">{title}</h2>
      {children}
    </section>
  )
}

function isAfipFile(name: string) {
  return /\.(pdf|jpe?g|png)$/i.test(name)
}

export function ArtForm({ art }: ArtFormProps) {
  const router = useRouter()
  const [empresa, setEmpresa] = useState(art.empresa)
  const [cuit, setCuit] = useState(art.cuit)
  const [actividad, setActividad] = useState(art.actividad)
  const [empleados, setEmpleados] = useState(art.empleados)
  const [masa, setMasa] = useState(art.masa)
  const [archivo, setArchivo] = useState(art.archivo)
  const [cargo, setCargo] = useState(art.cargo)
  const [errors, setErrors] = useState<ArtErrors>({})
  const payroll = Number(masa)
  const headcount = Number(empleados)

  function onArchivoChange(file: File | undefined) {
    setArchivo(file?.name ?? "")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: ArtErrors = {}
    const company = empresa.trim()
    const activity = actividad.trim()
    const role = cargo.trim()
    const fileName = archivo.trim()

    if (company.length < 2) nextErrors.empresa = "Ingresá el nombre de la empresa."
    if (!/^\d{11}$/.test(cuit)) nextErrors.cuit = "El CUIT tiene 11 números."
    if (activity.length < 3) nextErrors.actividad = "Ingresá la actividad económica."
    if (!empleados || !Number.isInteger(headcount) || headcount < 1) {
      nextErrors.empleados = "Ingresá la cantidad de empleados."
    }
    if (!masa || !Number.isFinite(payroll) || payroll < 1) {
      nextErrors.masa = "Ingresá la masa salarial."
    }
    if (fileName && !isAfipFile(fileName)) {
      nextErrors.archivo = "El formulario tiene que ser PDF, JPG o PNG."
    }
    if (role.length < 2) nextErrors.cargo = "Ingresá el cargo."

    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document.getElementById(firstError)?.scrollIntoView({ block: "center" })
      return
    }

    router.push(
      artHref("/cotizar/art/asegurado", art, {
        empresa: company,
        cuit,
        actividad: activity,
        empleados,
        masa,
        archivo: fileName,
        cargo: role,
      }),
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <ScreenBody>
        <ScreenTitle>Cotizá ART</ScreenTitle>

        <FormSection title="1. Datos de la Empresa">
          <TextField
            label="Nombre de la Empresa"
            name="empresa"
            placeholder="Ingresa el nombre de la empresa"
            value={empresa}
            onChange={(event) => setEmpresa(event.target.value)}
            error={errors.empresa}
          />
          <TextField
            label="CUIT"
            name="cuit"
            inputMode="numeric"
            placeholder="Ej: 20-12345678-9"
            value={formatCuit(cuit)}
            onChange={(event) => setCuit(digitsOnly(event.target.value).slice(0, 11))}
            error={errors.cuit}
          />
          <TextField
            label="Actividad Económica de tu empresa (CIIU)"
            name="actividad"
            placeholder="Ej: Comercio, Construcción, Metalúrgica..."
            value={actividad}
            onChange={(event) => setActividad(event.target.value)}
            error={errors.actividad}
          />
        </FormSection>

        <FormSection title="2. Tus empleados">
          <TextField
            label="¿Cuántos empleados tenes?"
            name="empleados"
            inputMode="numeric"
            placeholder="Ej: 5"
            value={empleados}
            onChange={(event) => setEmpleados(digitsOnly(event.target.value).slice(0, 6))}
            error={errors.empleados}
          />
          <TextField
            label="¿Cuál es la suma total de los salarios brutos de todos tus empleados? (masa salarial)"
            name="masa"
            inputMode="numeric"
            placeholder="Ej: $ 2.500.000"
            value={masa ? formatPesos(Number(masa)) : ""}
            onChange={(event) => setMasa(digitsOnly(event.target.value).slice(0, 12))}
            error={errors.masa}
          />
          <TextField
            label="Adjuntar Formulario AFIP 931"
            name="archivo"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => onArchivoChange(event.target.files?.[0])}
            error={errors.archivo}
          />
        </FormSection>

        <FormSection title="3. Datos de Contacto">
          <TextField
            label="Cargo de la persona que solicita la cotización"
            name="cargo"
            placeholder="Ej: Dueño, Gerente, Administrador..."
            value={cargo}
            onChange={(event) => setCargo(event.target.value)}
            error={errors.cargo}
          />
        </FormSection>

        <BrandButton type="submit">Continuar</BrandButton>
      </ScreenBody>
    </form>
  )
}
