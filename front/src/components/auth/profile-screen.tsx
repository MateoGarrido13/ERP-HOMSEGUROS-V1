"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { guardarPerfil, type EstadoGuardarPerfil } from "../../app/(app)/perfil/actions";
import {
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
    <div className="flex flex-col gap-4 p-6">
      {contrasenaActualizada ? (
        <p
          role="status"
          className="rounded-xl border border-line bg-stage px-3 py-2.5 text-sm text-title"
        >
          Contraseña actualizada.
        </p>
      ) : null}
      <ScreenTitle className="text-[22px]">
        {usuario.nombrePila} {usuario.apellido}
      </ScreenTitle>
      {editando ? (
        <form action={action} noValidate className="flex flex-col gap-3.5">
          {estado.formError ? (
            <p
              ref={alertaRef}
              role="alert"
              tabIndex={-1}
              className="rounded-xl border border-danger-border bg-danger-bg px-3 py-2.5 text-sm text-danger outline-none"
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
          {tarjetaFija}
          <BrandButton type="submit" disabled={pendiente}>
            {pendiente ? "Guardando…" : "Guardar"}
          </BrandButton>
          <BrandButton type="button" variant="outline" disabled={pendiente} onClick={cancelar}>
            Cancelar
          </BrandButton>
        </form>
      ) : (
        <>
          <SurfaceCard>
            <dl className="flex flex-col gap-3">
              {filasFijas.map((f) => (
                <Fila key={f.etiqueta} {...f} />
              ))}
              <Fila etiqueta="Teléfono" valor={telefonoLegible(usuario.telefono)} />
            </dl>
          </SurfaceCard>
          <BrandButton type="button" onClick={empezarEdicion}>
            Editar
          </BrandButton>
          {hrefCambiarContrasena ? (
            <Link
              href={hrefCambiarContrasena}
              className="text-center text-sm text-link underline underline-offset-2"
            >
              Cambiar contraseña
            </Link>
          ) : null}
          <div className="text-center">
            <LogoutButton />
          </div>
        </>
      )}
    </div>
  );
}
