import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface CreateClientOptions {
  // "Recordarme" (RN-6 de ERP-5, épica 4.4): @supabase/ssr siempre fija un
  // Max-Age largo por su cuenta, sin forma de pedirle que no fije ninguno
  // vía sus propias opciones. Con recordar=false sacamos maxAge/expires acá
  // antes de escribir la cookie, para que quede como cookie de sesión del
  // navegador. Default true: todo lo que no sea el login de ERP-5 (validar
  // sesión, cerrar sesión) no necesita decidir esto.
  recordar?: boolean;
}

// Para Server Components, Server Actions y Route Handlers. `cookies()` es
// async en esta versión de Next (ver node_modules/next/dist/docs); por eso
// este cliente también se crea async.
export async function createClient({ recordar = true }: CreateClientOptions = {}) {
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
            // maxAge === 0 es un borrado explícito (signOut): nunca tocarlo,
            // o la cookie quedaría puesta en vez de borrada.
            const finalOptions =
              recordar || options?.maxAge === 0
                ? options
                : { ...options, maxAge: undefined, expires: undefined };
            cookieStore.set(name, value, finalOptions);
          }
        } catch {
          // ver comentario arriba
        }
      },
    },
  });
}
