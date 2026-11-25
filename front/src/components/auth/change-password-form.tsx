"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  cambiarContrasena,
  type EstadoCambiarContrasena,
} from "../../app/(app)/perfil/contrasena/actions";
import { PASSWORD_POLICY_HINT } from "../../lib/auth/validation";
import { BrandButton } from "../ui/brand-button";
import { TextField } from "../ui/text-field";

const ESTADO_INICIAL: EstadoCambiarContrasena = {};

export function ChangePasswordForm() {
  const [estado, action, pending] = useActionState(cambiarContrasena, ESTADO_INICIAL);
  const actualRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (estado.currentError) actualRef.current?.focus();
    else if (estado.passwordError) passwordRef.current?.focus();
    else if (estado.confirmError) confirmRef.current?.focus();
    else if (estado.formError) alertRef.current?.focus();
  }, [estado]);

  return (
    <form action={action} className="flex flex-col gap-5">
      {estado.formError ? (
        <p
          ref={alertRef}
          role="alert"
          tabIndex={-1}
          className="rounded-xl border border-danger-border bg-danger-bg px-3 py-2.5 text-sm text-danger outline-none"
        >
          {estado.formError}
        </p>
      ) : null}
      <TextField
        ref={actualRef}
        label="Contraseña actual"
        name="actual"
        type="password"
        autoComplete="current-password"
        error={estado.currentError}
      />
      <TextField
        ref={passwordRef}
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        hint={PASSWORD_POLICY_HINT}
        error={estado.passwordError}
      />
      <TextField
        ref={confirmRef}
        label="Confirmación"
        name="confirm"
        type="password"
        autoComplete="new-password"
        error={estado.confirmError}
      />
      <BrandButton type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </BrandButton>
    </form>
  );
}
