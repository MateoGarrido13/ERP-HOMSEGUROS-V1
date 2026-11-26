import { RecoverForm } from "../../../components/auth/recover-form";
import { AuthShell } from "../../../components/layout/auth-shell";
import { ScreenTitle } from "../../../components/ui/screen-title";

export default function RecuperarPage() {
  return (
    <AuthShell volver>
      <div className="flex flex-col gap-2">
        <ScreenTitle className="text-center">Recuperar contraseña</ScreenTitle>
        <p className="text-center text-sm leading-snug text-slate">
          Ingresá tu email y te mandamos un enlace para elegir una contraseña nueva.
        </p>
      </div>
      <RecoverForm />
    </AuthShell>
  );
}
