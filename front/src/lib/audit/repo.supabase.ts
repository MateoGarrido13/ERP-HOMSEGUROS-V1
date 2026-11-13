import { createClient } from "../supabase/server";
import type { AccionAuditoria, Rol } from "../auth/types";

export interface AuditoriaRepo {
  registrar(usuarioId: string, rol: Rol, accion: AccionAuditoria): Promise<void>;
}

// La policy de auditoria (ver supabase/migrations) solo permite INSERT con
// usuario_id = auth.uid(): esta clase corre con el cliente de la sesión del
// propio usuario (createClient de supabase/server.ts), no con una
// service_role aparte.
export class AuditoriaRepoSupabase implements AuditoriaRepo {
  async registrar(usuarioId: string, rol: Rol, accion: AccionAuditoria): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("auditoria").insert({
      usuario_id: usuarioId,
      rol,
      accion,
    });

    if (error) {
      throw new Error(`No se pudo registrar la auditoría: ${error.message}`);
    }
  }
}
