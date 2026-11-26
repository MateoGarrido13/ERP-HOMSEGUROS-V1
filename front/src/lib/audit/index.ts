import { AuditoriaRepoSupabase } from "./repo.supabase";
import type { AccionAuditoria, Rol } from "../auth/types";
import { motivoSeguro } from "../errores";

const auditoriaRepo = new AuditoriaRepoSupabase();

// Helper que usan las Server Actions (T-11 la llama tras un ingreso
// exitoso). Es la única implementación de AuditoriaRepo hoy; si en algún
// momento hiciera falta elegir otra, este helper es el único lugar a tocar.
export function registrarAuditoria(usuarioId: string, rol: Rol, accion: AccionAuditoria) {
  return auditoriaRepo.registrar(usuarioId, rol, accion);
}

// Para los caminos donde la acción principal ya se hizo y no se puede deshacer
// (ERP-291): si la auditoría falla, no se rompe la operación, pero queda un
// registro estructurado y buscable (`evento: "auditoria.fallo"`) para alertar
// o revisar a mano. Solo se loguea el mensaje del error (sin URLs y acotado,
// ver `motivoSeguro`), nunca el objeto completo, para no arrastrar tokens ni
// contraseñas.
export async function registrarAuditoriaSinFallar(
  usuarioId: string,
  rol: Rol,
  accion: AccionAuditoria,
): Promise<boolean> {
  try {
    await registrarAuditoria(usuarioId, rol, accion);
    return true;
  } catch (error) {
    console.error(
      "[auditoria]",
      JSON.stringify({
        evento: "auditoria.fallo",
        accion,
        usuarioId,
        rol,
        motivo: motivoSeguro(error),
      }),
    );
    return false;
  }
}
