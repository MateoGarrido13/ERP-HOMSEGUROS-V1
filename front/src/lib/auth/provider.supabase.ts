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
import type { ResultadoSignIn, Rol, Usuario } from "./types";

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
    // Solo este dispositivo (ERP-8 PA-1): el alcance global cerraría los demás.
    await supabase.auth.signOut({ scope: "local" });
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

  async resetPassword(
    token: string,
    nueva: string,
    alCambiar?: (quien: { usuarioId: string; rol: Rol }) => Promise<void>,
  ): Promise<ResultadoReset> {
    const supabase = await createClient();

    // verifyOtp consume el enlace (un solo uso) y abre una sesión de
    // recuperación; se cierra siempre antes de salir (solo esta sesión).
    const { data, error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: token });
    if (error || !data.user) {
      return { ok: false, motivo: motivoDeVerifyOtp(error) };
    }

    // ERP-292: cerrar la sesión de recuperación nunca debe cambiar el resultado
    // (la contraseña puede haber cambiado ya y el enlace está gastado).
    const idRecuperacion = data.user.id;
    const cerrar = async () => {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (error) {
        console.error(
          "[recuperacion]",
          JSON.stringify({
            evento: "recuperacion.signout-fallo",
            usuarioId: idRecuperacion,
            motivo: error instanceof Error ? error.message : "error desconocido",
          }),
        );
      }
    };

    // El enlace ya se gastó: un fallo pasajero de la base no debe dejar al
    // usuario con un "probá de nuevo" que no puede cumplir. Se reintenta una
    // vez y, si sigue fallando, se cierra sin cambiar nada (RN-5: no se puede
    // confirmar que la cuenta esté activa) y se informa que hay que pedir otro.
    const usuarioId = data.user.id;
    const leerFila = () =>
      supabase
        .from("usuario")
        .select("rol, estado")
        .eq("id", usuarioId)
        .single<{ rol: Usuario["rol"]; estado: Usuario["estado"] }>();
    let { data: fila, error: filaError } = await leerFila();
    if (filaError || !fila) {
      ({ data: fila, error: filaError } = await leerFila());
    }
    if (filaError || !fila) {
      await cerrar();
      return { ok: false, motivo: "enlace-invalido" };
    }
    // RN-5: una cuenta suspendida no puede restablecer.
    if (fila.estado === "suspendido") {
      await cerrar();
      return { ok: false, motivo: "enlace-invalido" };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: nueva });
    if (updateError) {
      await cerrar();
      return { ok: false, motivo: motivoDeUpdateUser(updateError) };
    }

    try {
      await alCambiar?.({ usuarioId, rol: fila.rol });
    } catch (error) {
      // La contraseña ya cambió: un fallo de quien llama no la deshace, pero
      // queda un registro buscable (ERP-291).
      console.error(
        "[recuperacion]",
        JSON.stringify({
          evento: "recuperacion.alcambiar-fallo",
          usuarioId,
          motivo: error instanceof Error ? error.message : "error desconocido",
        }),
      );
    } finally {
      await cerrar();
    }

    return { ok: true, usuarioId, rol: fila.rol };
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

    // RLS (productor_select_propio) solo deja ver la fila del propio usuario:
    // un PAS nunca lee la matrícula de otro. Directivo y administrativo no
    // tienen fila de productor, así que quedan sin matrícula.
    const { data: productor } = await supabase
      .from("productor")
      .select("matricula_ssn")
      .eq("id", id)
      .maybeSingle<{ matricula_ssn: string }>();

    return {
      id: fila.id,
      email: fila.email,
      nombre: nombreCompleto(fila),
      nombrePila: fila.nombre,
      apellido: fila.apellido,
      telefono: fila.telefono,
      rol: fila.rol,
      organizacion: fila.organizacion,
      estado: fila.estado,
      matricula: productor?.matricula_ssn ?? null,
    };
  }

  // Solo escribe `nombre` (el apellido queda fijo) y `telefono`. La base lo
  // refuerza: el UPDATE está limitado a esas columnas y a la fila propia.
  async actualizarPerfil(
    id: string,
    datos: { nombre: string; telefono: string },
  ): Promise<void> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("usuario")
      .update({ nombre: datos.nombre, telefono: datos.telefono })
      .eq("id", id)
      .select("id");

    if (error) {
      throw new Error(`No se pudo actualizar el perfil: ${error.message}`);
    }
    // RLS filtra en silencio las filas ajenas: 0 filas = guardado sin efecto.
    if (!data || data.length !== 1) {
      throw new Error("No se pudo actualizar el perfil: no se modificó ninguna fila");
    }
  }
}
