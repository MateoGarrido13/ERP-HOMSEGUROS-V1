import Link from "next/link";

import { ChangePasswordForm } from "../../../../components/auth/change-password-form";
import { ScreenTitle } from "../../../../components/ui/screen-title";

// El layout de (app) ya exige sesión (verifySession); la acción lo vuelve a exigir.
export default function CambiarContrasenaPage() {
  return (
    <main className="flex flex-col gap-5 p-6 lg:max-w-[424px] lg:p-8">
      <ScreenTitle>Cambiar contraseña</ScreenTitle>
      <ChangePasswordForm />
      <Link href="/perfil" className="text-center text-sm text-link underline underline-offset-2 lg:text-left">
        Volver al perfil
      </Link>
    </main>
  );
}
