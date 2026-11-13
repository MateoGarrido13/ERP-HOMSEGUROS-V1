"use server";

import { redirect } from "next/navigation";

import { registrarAuditoria } from "../../lib/audit";
import { AuthProviderSupabase } from "../../lib/auth/provider.supabase";
import { emailFieldError, inicioDelRol, normalizarEmail } from "../../lib/auth/validation";

export interface EstadoIniciarSesion {
  emailError?: string;
  passwordError?: string;
  formError?: string;
}

const MENSAJE_CREDENCIALES = "Email o contraseña incorrectos.";
const MENSAJE_SERVICIO = "No pudimos completar la operación. Probá de nuevo.";

export async function iniciarSesion(
  _prev: EstadoIniciarSesion,
  formData: FormData,
): Promise<EstadoIniciarSesion> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const recordar = formData.get("recordar") === "on";

  const emailError = emailFieldError(email);
  const passwordError = password ? undefined : "Completá la contraseña.";
  if (emailError || passwordError) {
    return { emailError: emailError ?? undefined, passwordError };
  }

  const provider = new AuthProviderSupabase();
  const resultado = await provider.signIn(normalizarEmail(email), password, recordar);

  if (!resultado.ok) {
    if (resultado.motivo === "servicio") {
      return { formError: MENSAJE_SERVICIO };
    }
    // credenciales e inactiva comparten el mismo mensaje (RN-1/RN-2, CU-01 RN_3/RN_4).
    return { formError: MENSAJE_CREDENCIALES };
  }

  try {
    await registrarAuditoria(resultado.usuario.id, resultado.usuario.rol, "ingreso");
  } catch {
    // PA-3 de la épica: si falla la auditoría, la operación no se completa.
    await provider.destroySession();
    return { formError: MENSAJE_SERVICIO };
  }

  redirect(inicioDelRol(resultado.usuario.rol));
}
