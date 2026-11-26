"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { guardarPerfil, type EstadoGuardarPerfil } from "../../app/(app)/perfil/actions";
import {
  iniciales,
  parsearTelefono,
  telefonoLegible,
  type TelefonoPartes,
} from "../../lib/auth/validation";
import type { Usuario } from "../../lib/auth/types";
import { BrandButton } from "../ui/brand-button";
import { ScreenTitle } from "../ui/screen-title";
import { SurfaceCard } from "../ui/surface-card";
import { TextField } from "../ui/text-field";
import { LogoutButton } from "./logout-button";
import { PhoneField } from "./phone-field";

const ROLES: Record<Usuario["rol"], string> = {
  pas: "Productor asesor de seguros",
  directivo: "Directivo",
  administrativo: "Administrativo",
};

type DatosPerfil = Pick<
  Usuario,
  "nombrePila" | "apellido" | "telefono" | "rol" | "organizacion" | "matricula"
>;

interface ProfileScreenProps {
  usuario: DatosPerfil;
  // Destino de "Cambiar contraseña": lo crea ERP-6 (/perfil/contrasena). Sin
  // valor, el enlace no se muestra para no apuntar a una ruta inexistente.
  hrefCambiarContrasena?: string;
  // Aviso de éxito tras cambiar la contraseña (ERP-6): `/perfil?aviso=...`.
  contrasenaActualizada?: boolean;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium tracking-wide text-hint">{etiqueta.toUpperCase()}</dt>
      <dd className="mt-1 text-sm font-light text-title">{valor}</dd>
    </div>
  );
}

export function ProfileScreen({
  usuario,
  hrefCambiarContrasena,
  contrasenaActualizada = false,
}: ProfileScreenProps) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario.nombrePila);
  const [telefono, setTelefono] = useState<TelefonoPartes>(() => parsearTelefono(usuario.telefono));

  const [estado, action, pendiente] = useActionState(
    async (prev: EstadoGuardarPerfil, formData: FormData) => {
      const resultado = await guardarPerfil(prev, formData);
      if (resultado.ok) setEditando(false);
      return resultado;
    },
    {} as EstadoGuardarPerfil,
  );

  const nombreRef = useRef<HTMLInputElement>(null);
  const prefijoRef = useRef<HTMLSelectElement>(null);
  const alertaRef = useRef<HTMLParagraphElement>(null);

  // Foco: al entrar en edición, al nombre; tras un error, al primer campo
  // con error (o al aviso general).
  useEffect(() => {
    if (editando) nombreRef.current?.focus();
  }, [editando]);

  useEffect(() => {
    if (estado.nameError) nombreRef.current?.focus();
    else if (estado.phoneError) prefijoRef.current?.focus();
    else if (estado.formError) alertaRef.current?.focus();
  }, [estado]);

  function empezarEdicion() {
    setNombre(usuario.nombrePila);
    setTelefono(parsearTelefono(usuario.telefono));
    setEditando(true);
  }

  // Cancelar no llama al servidor: se descarta lo escrito (RN-4).
  function cancelar() {
    setNombre(usuario.nombrePila);
    setTelefono(parsearTelefono(usuario.telefono));
    setEditando(false);
  }

  const filasFijas = [
    { etiqueta: "Rol", valor: ROLES[usuario.rol] },
    // SUP-1: sin matrícula (directivo, administrativo) se omite la fila.
    ...(usuario.matricula ? [{ etiqueta: "Matrícula", valor: usuario.matricula }] : []),
    { etiqueta: "Organización", valor: usuario.organizacion },
  ];

  const tarjetaFija = (
    <SurfaceCard>
      <dl className="flex flex-col gap-3">
        {filasFijas.map((f) => (
          <Fila key={f.etiqueta} {...f} />
        ))}
      </dl>
    </SurfaceCard>
  );

  return (
    <div className="flex flex-col gap-4 p-6 lg:max-w-[720px] lg:gap-5 lg:p-8">
      {contrasenaActualizada ? (
        <p
          role="status"
          className="rounded-xl border border-line bg-stage px-3 py-2.5 text-sm text-title"
        >
          Contraseña actualizada.
        </p>
      ) : null}
      {editando ? (
        <button
          type="button"
          onClick={cancelar}
          className="hidden items-center gap-1 self-start text-sm text-slate hover:text-title lg:flex"
        >
          <span aria-hidden="true">‹</span> Perfil
        </button>
      ) : null}
      {editando ? null : (
        <div
          aria-hidden="true"
          className="hidden h-[72px] w-[72px] items-center justify-center rounded-full bg-nav-active text-lg font-medium text-primary lg:flex"
        >
          {iniciales(usuario.nombrePila, usuario.apellido)}
        </div>
      )}
      <ScreenTitle className="text-[22px] lg:text-[26px]">
        {usuario.nombrePila} {usuario.apellido}
      </ScreenTitle>
      {editando ? (
        <form action={action} noValidate className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
          {estado.formError ? (
            <p
              ref={alertaRef}
              role="alert"
              tabIndex={-1}
              className="rounded-xl border border-danger-border bg-danger-bg px-3 py-2.5 text-sm text-danger outline-none lg:col-span-2"
            >
              {estado.formError}
            </p>
          ) : null}
          <TextField
            ref={nombreRef}
            label="Nombre"
            name="nombre"
            autoComplete="given-name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={estado.nameError}
          />
          <PhoneField
            ref={prefijoRef}
            value={telefono}
            onChange={setTelefono}
            error={estado.phoneError}
          />
          <div className="lg:col-span-2 lg:max-w-[560px]">{tarjetaFija}</div>
          <div className="flex flex-col gap-3.5 lg:col-span-2 lg:flex-row lg:gap-3">
            <BrandButton type="submit" disabled={pendiente} className="lg:w-auto lg:px-6">
              {pendiente ? "Guardando…" : "Guardar"}
            </BrandButton>
            <BrandButton
              type="button"
              variant="outline"
              disabled={pendiente}
              onClick={cancelar}
              className="lg:w-auto lg:px-6"
            >
              Cancelar
            </BrandButton>
          </div>
        </form>
      ) : (
        <>
          <SurfaceCard className="lg:max-w-[560px]">
            <dl className="flex flex-col gap-3">
              {filasFijas.map((f) => (
                <Fila key={f.etiqueta} {...f} />
              ))}
              <Fila etiqueta="Teléfono" valor={telefonoLegible(usuario.telefono)} />
            </dl>
          </SurfaceCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3">
            <BrandButton type="button" onClick={empezarEdicion} className="lg:w-auto lg:px-6">
              Editar
            </BrandButton>
            {hrefCambiarContrasena ? (
              <Link
                href={hrefCambiarContrasena}
                className="text-center text-sm text-link underline underline-offset-2 lg:inline-flex lg:h-10 lg:items-center lg:justify-center lg:rounded-full lg:border lg:border-field-line lg:px-6 lg:font-medium lg:text-title lg:no-underline lg:hover:bg-stage"
              >
                Cambiar contraseña
              </Link>
            ) : null}
            <div className="text-center lg:ml-3">
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
