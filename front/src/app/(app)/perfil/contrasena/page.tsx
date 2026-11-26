import Link from "next/link";

import { ChangePasswordForm } from "../../../../components/auth/change-password-form";
import { ScreenTitle } from "../../../../components/ui/screen-title";

// El layout de (app) ya exige sesión (verifySession); la acción lo vuelve a exigir.
export default function CambiarContrasenaPage() {
  return (
    <main className="flex flex-col gap-5 p-6">
      <ScreenTitle>Cambiar contraseña</ScreenTitle>
      <ChangePasswordForm />
      <Link href="/perfil" className="text-center text-sm text-link underline underline-offset-2">
        Volver al perfil
      </Link>
    </main>
  );
}
