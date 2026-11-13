import { createClient } from "../supabase/server";
import { normalizarEmail } from "./validation";
import type {
  AuthProvider,
  EstadoTokenReset,
  ResultadoCambioPassword,
  ResultadoReset,
  ResultadoRequestReset,
  SesionValidada,
  UsuarioRepo,
} from "./provider";
import type { ResultadoSignIn, Usuario } from "./types";

interface FilaUsuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: Usuario["rol"];
  organizacion: string;
  estado: Usuario["estado"];
}

function nombreCompleto(fila: FilaUsuario) {
  return `${fila.nombre} ${fila.apellido}`.trim();
}

export class AuthProviderSupabase implements AuthProvider {
  async signIn(email: string, password: string, recordar = true): Promise<ResultadoSignIn> {
    const supabase = await createClient({ recordar });
    const normalizado = normalizarEmail(email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizado,
      password,
    });

    if (error) {
      if (error.code === "invalid_credentials") {
        return { ok: false, motivo: "credenciales" };
      }
      return { ok: false, motivo: "servicio" };
    }

    const { data: fila, error: usuarioError } = await supabase
      .from("usuario")
      .select("id, email, nombre, apellido, telefono, rol, organizacion, estado")
      .eq("id", data.user.id)
      .single<FilaUsuario>();

    if (usuarioError || !fila) {
      await supabase.auth.signOut();
      return { ok: false, motivo: "servicio" };
    }

    if (fila.estado === "suspendido") {
      await supabase.auth.signOut();
      return { ok: false, motivo: "inactiva" };
    }

    return {
      ok: true,
      usuario: {
        id: fila.id,
        email: fila.email,
        nombre: nombreCompleto(fila),
        telefono: fila.telefono,
        rol: fila.rol,
      },
    };
  }

  async validateSession(): Promise<SesionValidada | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { usuarioId: data.user.id };
  }

  async destroySession(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  async requestPasswordReset(_email: string): Promise<ResultadoRequestReset> {
    throw new Error("No implementado (ERP-6)");
  }

  async checkResetToken(_token: string): Promise<EstadoTokenReset> {
    throw new Error("No implementado (ERP-6)");
  }

  async resetPassword(_token: string, _nueva: string): Promise<ResultadoReset> {
    throw new Error("No implementado (ERP-6)");
  }

  async changePassword(
    _usuarioId: string,
    _actual: string,
    _nueva: string,
  ): Promise<ResultadoCambioPassword> {
    throw new Error("No implementado (ERP-6)");
  }
}

export class UsuarioRepoSupabase implements UsuarioRepo {
  async porId(id: string): Promise<Usuario | null> {
    const supabase = await createClient();
    const { data: fila, error } = await supabase
      .from("usuario")
      .select("id, email, nombre, apellido, telefono, rol, organizacion, estado")
      .eq("id", id)
      .single<FilaUsuario>();

    if (error || !fila) return null;

    return {
      id: fila.id,
      email: fila.email,
      nombre: nombreCompleto(fila),
      telefono: fila.telefono,
      rol: fila.rol,
      organizacion: fila.organizacion,
      estado: fila.estado,
    };
  }

  async actualizarPerfil(
    _id: string,
    _datos: { nombre: string; telefono: string },
  ): Promise<void> {
    // Separar "nombre" en nombre/apellido al escribir no está decidido
    // (PA-9 de la épica solo resolvió cómo se lee); se implementa en ERP-7.
    throw new Error("No implementado (ERP-7)");
  }
}
