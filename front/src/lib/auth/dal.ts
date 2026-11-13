import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "../supabase/server";
import { getAuthUser } from "./session";
import type { EstadoUsuario, Rol } from "./types";

export interface Sesion {
  usuarioId: string;
  rol: Rol;
}

interface FilaRolEstado {
  rol: Rol;
  estado: EstadoUsuario;
}

async function rolYEstado(usuarioId: string): Promise<FilaRolEstado | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuario")
    .select("rol, estado")
    .eq("id", usuarioId)
    .single<FilaRolEstado>();

  if (error || !data) return null;
  return data;
}

// Barrera real de autorización (épica 4.1): se llama desde cada página y
// cada Server Action protegida. Redirige a `/` sin sesión válida o con la
// cuenta suspendida (y en ese caso, además, destruye la sesión).
export const verifySession = cache(async (): Promise<Sesion> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/");
  }

  const fila = await rolYEstado(authUser.id);
  if (!fila || fila.estado === "suspendido") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return { usuarioId: authUser.id, rol: fila.rol };
});

// Para `/`: si ya hay sesión válida, se usa para redirigir al inicio del
// rol sin pedir contraseña (CA-7 de ERP-5). A diferencia de verifySession,
// no redirige: devuelve null y la página decide.
export const getSessionOptional = cache(async (): Promise<Sesion | null> => {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const fila = await rolYEstado(authUser.id);
  if (!fila || fila.estado === "suspendido") return null;

  return { usuarioId: authUser.id, rol: fila.rol };
});
