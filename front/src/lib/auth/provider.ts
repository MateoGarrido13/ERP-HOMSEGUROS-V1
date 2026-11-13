import type { ResultadoSignIn, Usuario } from "./types";

export type ResultadoRequestReset = { enviado: boolean };

export type EstadoTokenReset = "vigente" | "vencido" | "usado" | "invalido";

export type ResultadoReset = "ok" | "enlace-invalido" | "igual-a-la-anterior";

export type ResultadoCambioPassword = "ok" | "actual-incorrecta" | "igual-a-la-anterior";

export interface SesionValidada {
  usuarioId: string;
}

// Épica 4.4. Esta interfaz no importa nada de Supabase (ni de ninguna otra
// base): la única implementación que lo hace es ./provider.supabase.ts.
// Cambiar de proveedor no debería requerir tocar páginas ni Server Actions.
export interface AuthProvider {
  signIn(email: string, password: string): Promise<ResultadoSignIn>;
  validateSession(): Promise<SesionValidada | null>;
  destroySession(): Promise<void>;
  requestPasswordReset(email: string): Promise<ResultadoRequestReset>;
  checkResetToken(token: string): Promise<EstadoTokenReset>;
  resetPassword(token: string, nueva: string): Promise<ResultadoReset>;
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
