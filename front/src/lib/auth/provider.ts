import type { ResultadoSignIn, Rol, Usuario } from "./types";

export type ResultadoRequestReset = { enviado: boolean };

export type EstadoTokenReset = "vigente" | "vencido" | "usado" | "invalido";

// Ampliación respecto de la épica 4.4 (ERP-6): `resetPassword` devuelve quién
// cambió la contraseña (la acción lo necesita para auditar `cambio-contrasena`
// y la sesión de recuperación ya se cerró), y suma "politica" y "servicio".
export type ResultadoReset =
  | { ok: true; usuarioId: string; rol: Rol }
  | { ok: false; motivo: "enlace-invalido" | "igual-a-la-anterior" | "politica" | "servicio" };

export type ResultadoCambioPassword =
  | "ok"
  | "actual-incorrecta"
  | "igual-a-la-anterior"
  | "politica"
  | "servicio";

export interface SesionValidada {
  usuarioId: string;
}

// Épica 4.4. Esta interfaz no importa nada de Supabase (ni de ninguna otra
// base): la única implementación que lo hace es ./provider.supabase.ts.
// Cambiar de proveedor no debería requerir tocar páginas ni Server Actions.
export interface AuthProvider {
  signIn(email: string, password: string, recordar?: boolean): Promise<ResultadoSignIn>;
  validateSession(): Promise<SesionValidada | null>;
  destroySession(): Promise<void>;
  requestPasswordReset(email: string): Promise<ResultadoRequestReset>;
  checkResetToken(token: string): Promise<EstadoTokenReset>;
  // `alCambiar` corre solo si la contraseña ya cambió y mientras la sesión de
  // recuperación sigue abierta: es el único momento en que hay `auth.uid()`
  // para auditar (la policy de `auditoria` lo exige). Si falla, no deshace el
  // cambio; quien lo pasa decide qué registrar.
  resetPassword(
    token: string,
    nueva: string,
    alCambiar?: (quien: { usuarioId: string; rol: Rol }) => Promise<void>,
  ): Promise<ResultadoReset>;
  changePassword(
    usuarioId: string,
    actual: string,
    nueva: string,
  ): Promise<ResultadoCambioPassword>;
}

export interface UsuarioRepo {
  porId(id: string): Promise<Usuario | null>;
  actualizarPerfil(id: string, datos: { nombre: string; telefono: string }): Promise<void>;
}
