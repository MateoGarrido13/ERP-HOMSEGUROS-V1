import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Para Client Components. ERP-5 no lo usa (el login es un Server Action),
// pero la épica lo deja listo para las pantallas de las demás US de Acceso.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
