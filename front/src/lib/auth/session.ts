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
