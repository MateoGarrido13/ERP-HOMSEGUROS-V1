"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  pedirRecuperacion,
  type EstadoPedirRecuperacion,
} from "../../app/(publico)/recuperar/actions";
import { BrandButton } from "../ui/brand-button";
import { TextField } from "../ui/text-field";

const ESTADO_INICIAL: EstadoPedirRecuperacion = {};

export function RecoverForm() {
  const [estado, action, pending] = useActionState(pedirRecuperacion, ESTADO_INICIAL);
  const [email, setEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (estado.emailError) emailRef.current?.focus();
    else if (estado.formError || estado.aviso) alertRef.current?.focus();
  }, [estado]);

  // Tras el aviso el formulario se oculta (spec 4.2).
  if (estado.aviso) {
    return (
      <div className="flex flex-col gap-5">
        <p
          ref={alertRef}
          role="status"
          tabIndex={-1}
          className="rounded-xl border border-line bg-stage px-3 py-2.5 text-sm text-title outline-none"
        >
          {estado.aviso}
        </p>
        <Link href="/" className="text-center text-sm text-link underline underline-offset-2">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

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
        ref={emailRef}
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="nombre@correo.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={estado.emailError}
      />
      <BrandButton type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar enlace"}
      </BrandButton>
      <Link href="/" className="text-center text-sm text-link underline underline-offset-2">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
