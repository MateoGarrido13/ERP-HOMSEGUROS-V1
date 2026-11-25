import "server-only";

import { createClient } from "../supabase/server";

// Wrapper fino sobre el cliente de Supabase: la cookie de sesión la gestiona
// @supabase/ssr (httpOnly, sameSite=lax, secure en producción), no hay una
// cookie propia. `dal.ts` construye `verifySession`/`getSessionOptional`
// sobre esto, cruzando con la tabla `usuario` (rol, estado).
export async function getAuthUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

// Borra la cookie de sesión de este dispositivo. Es idempotente: sin cookie
// también termina bien. No escribe auditoría.
export async function clearSession() {
  const supabase = await createClient();
  // Solo este dispositivo (ERP-8 PA-1): el alcance global cerraría los demás.
  await supabase.auth.signOut({ scope: "local" });
}
