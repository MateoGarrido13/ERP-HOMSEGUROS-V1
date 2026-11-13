import { NextResponse, type NextRequest } from "next/server";

// Chequeo optimista (épica 4.1): solo mira si existe la cookie de sesión de
// Supabase, nunca la valida contra la base. La barrera real es
// `verifySession()` en el DAL (T-6), llamada desde cada página protegida.
const RUTAS_PUBLICAS = new Set(["/", "/recuperar", "/recuperar/nueva"]);

// Nombre de cookie estándar de @supabase/ssr: `sb-<project-ref>-auth-token`.
function tieneCookieDeSesion(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => /^sb-.*-auth-token/.test(cookie.name));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RUTAS_PUBLICAS.has(pathname)) {
    // Con cookie, redirigir al inicio del rol requeriría consultarlo en la
    // base (no está en la cookie): esa redirección la hace la página (T-11),
    // no el proxy.
    return NextResponse.next();
  }

  if (!tieneCookieDeSesion(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
