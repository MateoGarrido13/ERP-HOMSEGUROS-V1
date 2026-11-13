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
    <div className="flex min-h-dvh flex-col bg-white px-6 pt-8 pb-6">
      <Image
        src="/hom-logo.png"
        alt="HOM, Profesionales en Seguros"
        width={216}
        height={73}
        priority
        className="mx-auto h-16 w-auto"
      />
      <div className="mx-auto mt-8 flex w-full max-w-sm flex-1 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <ScreenTitle className="text-center">Iniciar sesión</ScreenTitle>
          <p className="text-center text-sm leading-snug text-slate">
            Ingresá a Portal PAS con tu email y contraseña.
          </p>
        </div>
        <LoginForm />
      </div>
      <p className="mt-auto pt-10 text-center text-xs text-hint">Portal PAS · HOM Seguros</p>
    </div>
  );
}
