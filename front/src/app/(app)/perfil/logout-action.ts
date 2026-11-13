"use server";

import { redirect } from "next/navigation";

import { registrarAuditoria } from "../../../lib/audit";
import { getSessionOptional } from "../../../lib/auth/dal";
import { AuthProviderSupabase } from "../../../lib/auth/provider.supabase";
import { clearSession } from "../../../lib/auth/session";

// Cierra la sesión de este dispositivo. Con sesión válida audita `cierre`
// antes de destruirla (la política de auditoría exige la cookie todavía
// presente). Sin sesión, o si el proveedor falla, igual borra la cookie y
// vuelve al ingreso. Nunca muestra un error al usuario.
export async function cerrarSesion() {
  const sesion = await getSessionOptional();

  if (sesion) {
    try {
      await registrarAuditoria(sesion.usuarioId, sesion.rol, "cierre");
    } catch (error) {
      console.error("No se pudo auditar el cierre de sesión", error);
    }

    try {
      await new AuthProviderSupabase().destroySession();
    } catch (error) {
      console.error("No se pudo destruir la sesión en el proveedor", error);
      await borrarCookie();
    }
  } else {
    await borrarCookie();
  }

  redirect("/");
}

async function borrarCookie() {
  try {
    await clearSession();
  } catch (error) {
    console.error("No se pudo borrar la cookie de sesión", error);
  }
}
