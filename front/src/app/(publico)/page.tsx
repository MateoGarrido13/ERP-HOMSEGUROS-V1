import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "../../components/auth/login-form";
import { ScreenTitle } from "../../components/ui/screen-title";
import { getSessionOptional } from "../../lib/auth/dal";
import { inicioDelRol } from "../../lib/auth/validation";

export default async function IngresoPage() {
  const sesion = await getSessionOptional();
  if (sesion) {
    redirect(inicioDelRol(sesion.rol));
  }

  return (
    // Figma solo define el frame móvil (390×844): ahí (base, sin prefijo
    // sm:) ocupa todo el alto como en el diseño, con el pie pegado abajo.
    // En pantallas más anchas (sm: en adelante) se centra como una tarjeta
    // de ancho fijo sobre un fondo neutro, en vez de estirarse de punta a
    // punta y quedar pegada arriba (ver feedback del 2026-11-13).
    <div className="flex min-h-dvh flex-col bg-white sm:items-center sm:justify-center sm:bg-stage sm:px-4 sm:py-8">
      <div className="flex min-h-dvh w-full flex-1 flex-col bg-white px-6 pt-8 pb-6 sm:min-h-0 sm:max-w-[390px] sm:flex-none">
        <Image
          src="/hom-logo.png"
          alt="HOM, Profesionales en Seguros"
          width={216}
          height={73}
          priority
          className="mx-auto h-16 w-auto"
        />
        <div className="mx-auto mt-8 flex w-full flex-1 flex-col gap-5 sm:flex-none">
          <div className="flex flex-col gap-2">
            <ScreenTitle className="text-center">Iniciar sesión</ScreenTitle>
            <p className="text-center text-sm leading-snug text-slate">
              Ingresá a Portal PAS con tu email y contraseña.
            </p>
          </div>
          <LoginForm />
        </div>
        <p className="mt-auto pt-10 text-center text-xs text-hint sm:mt-10 sm:pt-0">
          Portal PAS · HOM Seguros
        </p>
      </div>
    </div>
  );
}
