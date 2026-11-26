"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { restablecer, type EstadoRestablecer } from "../../app/(publico)/recuperar/actions";
import { PASSWORD_POLICY_HINT } from "../../lib/auth/validation";
import { BrandButton } from "../ui/brand-button";
import { TextField } from "../ui/text-field";

const ESTADO_INICIAL: EstadoRestablecer = {};

export const MENSAJE_ENLACE_INVALIDO = "Este enlace ya no sirve. Pedí uno nuevo.";

export function EnlaceInvalido() {
  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="rounded-xl border border-danger-border bg-danger-bg px-3 py-2.5 text-sm text-danger">
        {MENSAJE_ENLACE_INVALIDO}
      </p>
      <Link href="/recuperar" className="text-center text-sm text-link underline underline-offset-2">
        Pedir un enlace nuevo
      </Link>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [estado, action, pending] = useActionState(restablecer, ESTADO_INICIAL);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (estado.passwordError) passwordRef.current?.focus();
    else if (estado.confirmError) confirmRef.current?.focus();
    else if (estado.formError) alertRef.current?.focus();
  }, [estado]);

  if (estado.enlaceInvalido && !estado.passwordError) {
    return <EnlaceInvalido />;
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
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
      {estado.enlaceInvalido ? (
        <Link href="/recuperar" className="text-center text-sm text-link underline underline-offset-2">
          Pedir un enlace nuevo
        </Link>
      ) : (
        <BrandButton type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar contraseña"}
        </BrandButton>
      )}
    </form>
  );
}
