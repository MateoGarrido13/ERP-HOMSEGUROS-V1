import { redirect } from "next/navigation";

import { LoginForm } from "../../components/auth/login-form";
import { AuthShell } from "../../components/layout/auth-shell";
import { ScreenTitle } from "../../components/ui/screen-title";
import { getSessionOptional } from "../../lib/auth/dal";
import { inicioDelRol } from "../../lib/auth/validation";

export default async function IngresoPage() {
  const sesion = await getSessionOptional();
  if (sesion) {
    redirect(inicioDelRol(sesion.rol));
  }

  return (
    <AuthShell pieEnMobile>
      <div className="flex flex-col gap-2">
        <ScreenTitle className="text-center">Iniciar sesión</ScreenTitle>
        <p className="text-center text-sm leading-snug text-slate">
          Ingresá a Portal PAS con tu email y contraseña.
        </p>
      </div>
      <LoginForm />
    </AuthShell>
  );
}
