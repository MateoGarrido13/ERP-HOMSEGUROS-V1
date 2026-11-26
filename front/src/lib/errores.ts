// Motivo de un error apto para logs: el mensaje de Supabase, PostgREST o fetch
// puede traer URLs con `token_hash` u otros datos de la solicitud, así que se
// reemplazan las URLs y se acota el largo antes de loguearlo.
export function motivoSeguro(error: unknown): string {
  const mensaje = error instanceof Error ? error.message : typeof error === "string" ? error : "error desconocido";
  return mensaje.replace(/https?:\/\/\S+/gi, "[url]").slice(0, 200);
}
