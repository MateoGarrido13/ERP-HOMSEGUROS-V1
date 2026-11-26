import type { Metadata } from "next";
import {
  EnlaceInvalido,
  ResetPasswordForm,
} from "../../../../components/auth/reset-password-form";
import { AuthShell } from "../../../../components/layout/auth-shell";
import { ScreenTitle } from "../../../../components/ui/screen-title";
import { AuthProviderSupabase } from "../../../../lib/auth/provider.supabase";

// El token viaja en la URL: que no salga en el encabezado Referer.
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false },
};

export default async function NuevaContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token: crudo } = await searchParams;
  const token = typeof crudo === "string" ? crudo : "";
  const estado = await new AuthProviderSupabase().checkResetToken(token);

  return (
    <AuthShell volver>
      <ScreenTitle className="text-center">Contraseña nueva</ScreenTitle>
      {estado === "vigente" ? <ResetPasswordForm token={token} /> : <EnlaceInvalido />}
    </AuthShell>
  );
}
