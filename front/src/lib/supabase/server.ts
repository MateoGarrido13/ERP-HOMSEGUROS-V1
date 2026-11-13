import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Para Server Components, Server Actions y Route Handlers. `cookies()` es
// async en esta versión de Next (ver node_modules/next/dist/docs); por eso
// este cliente también se crea async.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // cookies().set solo funciona en Server Actions/Route Handlers, no
        // al renderizar un Server Component; ahí falla y no hace falta
        // propagar el error (la sesión ya se refresca en la próxima
        // petición que sí pueda escribir cookies).
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ver comentario arriba
        }
      },
    },
  });
}
