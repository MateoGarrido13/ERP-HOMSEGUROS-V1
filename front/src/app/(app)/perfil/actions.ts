"use server";

import { revalidatePath } from "next/cache";

import { registrarAuditoria } from "../../../lib/audit";
import { verifySession } from "../../../lib/auth/dal";
import { UsuarioRepoSupabase } from "../../../lib/auth/provider.supabase";
import {
  componerTelefono,
  nombreFieldError,
  telefonoPartesError,
} from "../../../lib/auth/validation";

export interface EstadoGuardarPerfil {
  nameError?: string;
  phoneError?: string;
  formError?: string;
  ok?: boolean;
}

const MENSAJE_FALLA = "No pudimos guardar los cambios. Probá de nuevo.";

// Spec ERP-7 4.4: el usuario sale de la sesión; solo se leen `nombre` y las
// tres partes del teléfono. Cualquier otro campo del formulario (usuarioId,
// rol, matricula, organizacion) se ignora.
export async function guardarPerfil(
  _prev: EstadoGuardarPerfil,
  formData: FormData,
): Promise<EstadoGuardarPerfil> {
  const { usuarioId, rol } = await verifySession();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const partes = {
    prefijo: String(formData.get("telefonoPrefijo") ?? ""),
    area: String(formData.get("telefonoArea") ?? ""),
    numero: String(formData.get("telefonoNumero") ?? ""),
  };

  const nameError = nombreFieldError(nombre);
  const phoneError = telefonoPartesError(partes);
  if (nameError || phoneError) {
    return { nameError: nameError ?? undefined, phoneError: phoneError ?? undefined };
  }

  const repo = new UsuarioRepoSupabase();
  const telefono = componerTelefono(partes);

  try {
    const anterior = await repo.porId(usuarioId);
    await repo.actualizarPerfil(usuarioId, { nombre, telefono });

    try {
      await registrarAuditoria(usuarioId, rol, "perfil");
    } catch (error) {
      // PA-3 de la épica: si falla la auditoría la operación no se completa.
      console.error("No se pudo auditar el cambio de perfil", error);
      if (anterior) {
        try {
          await repo.actualizarPerfil(usuarioId, {
            nombre: anterior.nombrePila,
            telefono: anterior.telefono,
          });
        } catch (reversion) {
          console.error("No se pudo revertir el cambio de perfil", reversion);
        }
      }
      return { formError: MENSAJE_FALLA };
    }
  } catch (error) {
    console.error("No se pudo guardar el perfil", error);
    return { formError: MENSAJE_FALLA };
  }

  revalidatePath("/perfil");
  return { ok: true };
}
