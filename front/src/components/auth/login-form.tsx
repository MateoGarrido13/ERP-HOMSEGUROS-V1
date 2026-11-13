"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

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

  return (
    <form action={action} className="flex flex-col gap-5">
      {estado.formError ? (
        <p
          role="alert"
          className="rounded-xl border border-danger-border bg-danger-bg px-3 py-2.5 text-sm text-danger"
        >
          {estado.formError}
        </p>
      ) : null}
      <TextField
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
