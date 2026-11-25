"use server";

import { redirect } from "next/navigation";

import { registrarAuditoria } from "../../../../lib/audit";
import { verifySession } from "../../../../lib/auth/dal";
import { AuthProviderSupabase } from "../../../../lib/auth/provider.supabase";
import {
  MENSAJE_IGUAL_A_LA_ANTERIOR,
  MENSAJE_POLITICA,
  nuevaContrasenaErrors,
} from "../../../../lib/auth/validation";

export interface EstadoCambiarContrasena {
  currentError?: string;
  passwordError?: string;
  confirmError?: string;
  formError?: string;
}

const MENSAJE_SERVICIO = "No pudimos completar la operación. Probá de nuevo.";

export async function cambiarContrasena(
  _prev: EstadoCambiarContrasena,
  formData: FormData,
): Promise<EstadoCambiarContrasena> {
  // CA-11: el usuario sale de la sesión, nunca del formulario.
  const { usuarioId, rol } = await verifySession();

  const actual = String(formData.get("actual") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const currentError = actual ? undefined : "Completá la contraseña actual.";
  const errores = nuevaContrasenaErrors(password, confirm, actual || undefined);
  if (currentError || errores.passwordError || errores.confirmError) {
    return { currentError, ...errores };
  }

  const resultado = await new AuthProviderSupabase().changePassword(usuarioId, actual, password);
  switch (resultado) {
    case "ok":
      break;
    case "actual-incorrecta":
      return { currentError: "La contraseña actual no coincide." };
    case "igual-a-la-anterior":
      return { passwordError: MENSAJE_IGUAL_A_LA_ANTERIOR };
    case "politica":
      return { passwordError: MENSAJE_POLITICA };
    default:
      return { formError: MENSAJE_SERVICIO };
  }

  try {
    await registrarAuditoria(usuarioId, rol, "cambio-contrasena");
  } catch {
    return { formError: MENSAJE_SERVICIO };
  }

  redirect("/perfil?aviso=contrasena-actualizada");
}
