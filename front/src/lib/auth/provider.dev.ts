import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
import { AuthProviderSupabase, UsuarioRepoSupabase } from "./provider.supabase";

// ---------------------------------------------------------------------------
// Proveedor de desarrollo de ERP-6.
//
// La contraseña vive en Supabase Auth (ADR-004, PA-1). Este archivo no es otro
// almacén de claves: el token de un solo uso está en memoria (24 h) y el
// enlace se escribe en la consola del servidor porque todavía no hay correo.
// resetPassword persiste la clave nueva con la service role.
// ---------------------------------------------------------------------------

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface TokenReset {
  email: string;
  expiresAt: number;
  usado: boolean;
}

// Vigencia del token: 24 horas (PA-2, CU-02 SUP_2).
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function generarToken(): string {
  // crypto está disponible en Node.js (servidor Next.js).
  const buf = crypto.getRandomValues(new Uint8Array(32));
  let token = "";
  for (const b of buf) token += b.toString(16).padStart(2, "0");
  return token;
}

// ---------------------------------------------------------------------------
// Almacén de tokens de recuperación en memoria (solo desarrollo).
// Exportado para poder probar la lógica sin depender de Supabase.
// ---------------------------------------------------------------------------
export class TokenResetStore {
  private tokens = new Map<string, TokenReset>();
  private ahora = () => Date.now();

  constructor(inyectarAhora?: () => number) {
    if (inyectarAhora) this.ahora = inyectarAhora;
  }

  generarPara(email: string): string {
    // Invalidar cualquier token previo del mismo email (SUP-3).
    for (const [, datos] of this.tokens.entries()) {
      if (datos.email === email) {
        datos.usado = true;
      }
    }

    const token = generarToken();
    this.tokens.set(token, {
      email,
      expiresAt: this.ahora() + TOKEN_TTL_MS,
      usado: false,
    });
    return token;
  }

  estado(token: string): EstadoTokenReset {
    const datos = this.tokens.get(token);
    if (!datos) return "invalido";
    if (datos.usado) return "usado";
    if (datos.expiresAt < this.ahora()) return "vencido";
    return "vigente";
  }

  consumir(token: string): boolean {
    const datos = this.tokens.get(token);
    if (!datos || datos.usado || datos.expiresAt < this.ahora()) {
      return false;
    }
    datos.usado = true;
    return true;
  }

  emailDe(token: string): string | undefined {
    return this.tokens.get(token)?.email;
  }
}

export class AuthProviderDev implements AuthProvider {
  private readonly auth = new AuthProviderSupabase();
  private readonly tokens = new TokenResetStore();

  async signIn(
    email: string,
    password: string,
    recordar = true,
  ): Promise<ResultadoSignIn> {
    return this.auth.signIn(email, password, recordar);
  }

  async validateSession(): Promise<SesionValidada | null> {
    return this.auth.validateSession();
  }

  async destroySession(): Promise<void> {
    return this.auth.destroySession();
  }

  async requestPasswordReset(email: string): Promise<ResultadoRequestReset> {
    const normalizado = normalizarEmail(email);

    // RN-2 / RN-5: mismo aviso para email inexistente, cuenta inactiva o
    // suspendida. Solo generamos token si la cuenta existe y está activa.
    // No hay sesión: usuario_select exige auth.uid() = id, así que la
    // lectura va por la service role.
    const admin = adminClient();
    const { data: fila, error: usuarioError } = await admin
      .from("usuario")
      .select("id, estado")
      .eq("email", normalizado)
      .single<{ id: string; estado: Usuario["estado"] }>();

    if (usuarioError || !fila || fila.estado !== "activo") {
      return { enviado: true };
    }

    const token = this.tokens.generarPara(normalizado);
    const enlace = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/recuperar/nueva?token=${token}`;
    // Desarrollo: el enlace sale por consola, no por correo real.
    console.log(`[ERP-6 Dev] Enlace de recuperación para ${normalizado}: ${enlace}`);

    return { enviado: true };
  }

  async checkResetToken(token: string): Promise<EstadoTokenReset> {
    return this.tokens.estado(token);
  }

  async resetPassword(token: string, nueva: string): Promise<ResultadoReset> {
    const email = this.tokens.emailDe(token);
    if (!email || this.tokens.estado(token) !== "vigente") {
      return "enlace-invalido";
    }

    const admin = adminClient();
    const { data: fila, error: usuarioError } = await admin
      .from("usuario")
      .select("id")
      .eq("email", email)
      .single<{ id: string }>();

    if (usuarioError || !fila) {
      return "enlace-invalido";
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(fila.id, {
      password: nueva,
    });
    if (updateError) {
      throw new Error("No se pudo actualizar la contraseña en Supabase Auth");
    }

    this.tokens.consumir(token);
    return "ok";
  }

  async changePassword(
    _usuarioId: string,
    _actual: string,
    _nueva: string,
  ): Promise<ResultadoCambioPassword> {
    throw new Error("No implementado (ERP-6)");
  }
}

export class UsuarioRepoDev implements UsuarioRepo {
  private readonly repo = new UsuarioRepoSupabase();

  async porId(id: string): Promise<Usuario | null> {
    return this.repo.porId(id);
  }

  async actualizarPerfil(
    _id: string,
    _datos: { nombre: string; telefono: string },
  ): Promise<void> {
    throw new Error("No implementado (ERP-7)");
  }
}
