import { AuditoriaRepoSupabase } from "./repo.supabase";
import type { AccionAuditoria, Rol } from "../auth/types";

const auditoriaRepo = new AuditoriaRepoSupabase();

// Helper que usan las Server Actions (T-11 la llama tras un ingreso
// exitoso). Es la única implementación de AuditoriaRepo hoy; si en algún
// momento hiciera falta elegir otra, este helper es el único lugar a tocar.
export function registrarAuditoria(usuarioId: string, rol: Rol, accion: AccionAuditoria) {
  return auditoriaRepo.registrar(usuarioId, rol, accion);
}
