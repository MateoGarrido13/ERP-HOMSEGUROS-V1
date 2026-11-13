"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { iniciarSesion, type EstadoIniciarSesion } from "../../app/(publico)/actions";
import { BrandButton } from "../ui/brand-button";
import { TextField } from "../ui/text-field";

const ESTADO_INICIAL: EstadoIniciarSesion = {};

export function LoginForm() {
  const [estado, action, pending] = useActionState(iniciarSesion, ESTADO_INICIAL);
  // Spec 4.2: el valor se conserva entre errores solo del email, nunca de la
  // contraseña. React resetea los campos no controlados del <form> después
  // de una Server Action; el email queda controlado para que sobreviva a
  // ese reset, la contraseña se deja sin controlar (así se borra siempre).
  const [email, setEmail] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  // Foco al primer campo con error (T-12); si el error es general (sin
  // campo asociado), el foco va al aviso para que no quede perdido para
  // quien navega con teclado o lector de pantalla.
  useEffect(() => {
    if (estado.emailError) {
      emailRef.current?.focus();
    } else if (estado.passwordError) {
      passwordRef.current?.focus();
    } else if (estado.formError) {
      alertRef.current?.focus();
    }
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
      <TextField
        ref={passwordRef}
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        error={estado.passwordError}
      />
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate">
          <input
            type="checkbox"
            name="recordar"
            className="size-4 rounded border-field accent-primary"
          />
          Recordarme
        </label>
        <Link href="/recuperar" className="text-link underline underline-offset-2">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <BrandButton type="submit" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </BrandButton>
    </form>
  );
}
