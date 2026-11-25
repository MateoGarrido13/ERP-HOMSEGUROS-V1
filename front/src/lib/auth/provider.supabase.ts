import { headers } from "next/headers";
import { createClient as createStatelessClient } from "@supabase/supabase-js";

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

  // Supabase Auth manda el correo de recuperación (plantilla en
  // supabase/templates/recovery.html, enlace a /recuperar/nueva?token=<token_hash>).
  // Nunca revela si el email existe: Supabase responde igual para cuentas
  // inexistentes, y el límite nativo de pedidos se oculta como "enviado".
  async requestPasswordReset(email: string): Promise<ResultadoRequestReset> {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizarEmail(email), {
      redirectTo: `${await urlBase()}/recuperar/nueva`,
    });

    if (!error) return { enviado: true };
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { enviado: true };
    }
    return { enviado: false };
  }

  // Supabase no ofrece una consulta que no consuma el enlace (verifyOtp lo
  // gasta), así que acá solo se descarta lo que no tiene forma de token. La
  // vigencia real (vencido/usado) se comprueba al guardar, en resetPassword.
  async checkResetToken(token: string): Promise<EstadoTokenReset> {
    return /^[A-Za-z0-9_-]{16,}$/.test(token) ? "vigente" : "invalido";
  }

  async resetPassword(token: string, nueva: string): Promise<ResultadoReset> {
    const supabase = await createClient();

    // verifyOtp consume el enlace (un solo uso) y abre una sesión de
    // recuperación; se cierra siempre antes de salir (solo esta sesión).
    const { data, error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: token });
    if (error || !data.user) {
      return { ok: false, motivo: motivoDeVerifyOtp(error) };
    }

    const cerrar = () => supabase.auth.signOut({ scope: "local" });

    const { data: fila, error: filaError } = await supabase
      .from("usuario")
      .select("rol, estado")
      .eq("id", data.user.id)
      .single<{ rol: Usuario["rol"]; estado: Usuario["estado"] }>();
    if (filaError || !fila) {
      await cerrar();
      return { ok: false, motivo: "servicio" };
    }
    // RN-5: una cuenta suspendida no puede restablecer.
    if (fila.estado === "suspendido") {
      await cerrar();
      return { ok: false, motivo: "enlace-invalido" };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: nueva });
    await cerrar();
    if (updateError) return { ok: false, motivo: motivoDeUpdateUser(updateError) };

    return { ok: true, usuarioId: data.user.id, rol: fila.rol };
  }

  async changePassword(
    usuarioId: string,
    actual: string,
    nueva: string,
  ): Promise<ResultadoCambioPassword> {
    const supabase = await createClient();
    const { data: sesion, error: sesionError } = await supabase.auth.getUser();
    // El id viene de la sesión del servidor: si no coincide, no se toca nada.
    if (sesionError || !sesion.user?.email || sesion.user.id !== usuarioId) {
      return "servicio";
    }

    // La contraseña actual se comprueba con un cliente sin cookies, para no
    // reemplazar la sesión del navegador ni sus opciones de persistencia.
    const verificador = createStatelessClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: loginError } = await verificador.auth.signInWithPassword({
      email: sesion.user.email,
      password: actual,
    });
    if (loginError) {
      return loginError.code === "invalid_credentials" ? "actual-incorrecta" : "servicio";
    }
    // Se descarta la sesión auxiliar creada solo para verificar.
    await verificador.auth.signOut({ scope: "local" });

    if (actual === nueva) return "igual-a-la-anterior";

    const { error } = await supabase.auth.updateUser({ password: nueva });
    return error ? motivoDeUpdateUser(error) : "ok";
  }
}

async function urlBase() {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL;
  if (configurada) return configurada.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("127.0.0.1") || host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

interface ErrorAuth {
  code?: string;
  status?: number;
}

function motivoDeVerifyOtp(error: ErrorAuth | null) {
  // otp_expired / token vencido, usado o inexistente: el enlace ya no sirve.
  if (error && (error.status === undefined || error.status < 500) && error.status !== 429) {
    return "enlace-invalido" as const;
  }
  return "servicio" as const;
}

function motivoDeUpdateUser(error: ErrorAuth) {
  if (error.code === "same_password") return "igual-a-la-anterior" as const;
  if (error.code === "weak_password") return "politica" as const;
  return "servicio" as const;
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
