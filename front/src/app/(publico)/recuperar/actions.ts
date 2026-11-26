"use server";

import { redirect } from "next/navigation";

import { registrarAuditoria } from "../../../lib/audit";
import { AuthProviderSupabase } from "../../../lib/auth/provider.supabase";
import {
  MENSAJE_IGUAL_A_LA_ANTERIOR,
  MENSAJE_POLITICA,
  emailFieldError,
  nuevaContrasenaErrors,
  normalizarEmail,
} from "../../../lib/auth/validation";

export interface EstadoPedirRecuperacion {
  emailError?: string;
  aviso?: string;
  formError?: string;
}

export interface EstadoRestablecer {
  passwordError?: string;
  confirmError?: string;
  formError?: string;
  enlaceInvalido?: boolean;
}

const AVISO_RECUPERACION =
  "Si el email está registrado, va a llegar un mensaje para elegir una contraseña nueva. El enlace vence en 24 horas.";
const MENSAJE_ENVIO = "No pudimos enviar el mensaje. Probá de nuevo.";
const MENSAJE_SERVICIO = "No pudimos completar la operación. Probá de nuevo.";

export async function pedirRecuperacion(
  _prev: EstadoPedirRecuperacion,
  formData: FormData,
): Promise<EstadoPedirRecuperacion> {
  const email = String(formData.get("email") ?? "");

  // CA-2: con email inválido no se consulta nada.
  const emailError = emailFieldError(email);
  if (emailError) return { emailError };

  const { enviado } = await new AuthProviderSupabase().requestPasswordReset(
    normalizarEmail(email),
  );
  if (!enviado) return { formError: MENSAJE_ENVIO };

  // RN-2: mismo aviso exista o no la cuenta, esté o no activa.
  return { aviso: AVISO_RECUPERACION };
}

export async function restablecer(
  _prev: EstadoRestablecer,
  formData: FormData,
): Promise<EstadoRestablecer> {
  // El token viaja en el cuerpo de la acción; nunca se loguea.
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const provider = new AuthProviderSupabase();
  if ((await provider.checkResetToken(token)) !== "vigente") {
    return { enlaceInvalido: true };
  }

  const errores = nuevaContrasenaErrors(password, confirm);
  if (errores.passwordError || errores.confirmError) return errores;

  const resultado = await provider.resetPassword(token, password);
  if (!resultado.ok) {
    switch (resultado.motivo) {
      case "enlace-invalido":
        return { enlaceInvalido: true };
      case "igual-a-la-anterior":
        // Supabase ya consumió el enlace al verificarlo: hay que pedir otro.
        return {
          passwordError: MENSAJE_IGUAL_A_LA_ANTERIOR,
          formError: "El enlace ya se usó. Pedí uno nuevo para elegir otra contraseña.",
        };
      case "politica":
        return { passwordError: MENSAJE_POLITICA };
      default:
        return { formError: MENSAJE_SERVICIO };
    }
  }

  try {
    await registrarAuditoria(resultado.usuarioId, resultado.rol, "cambio-contrasena");
  } catch (error) {
    // La contraseña ya cambió y el enlace ya se gastó: decir que falló sería
    // falso y el usuario no podría reintentar. Se deja constancia en el log
    // (sin datos del enlace) y se sigue como éxito.
    console.error("No se pudo auditar el cambio de contraseña (recuperación)", error);
  }

  redirect("/?aviso=contrasena-actualizada");
}
