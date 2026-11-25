import type { Metadata } from "next";
import Image from "next/image";

import {
  EnlaceInvalido,
  ResetPasswordForm,
} from "../../../../components/auth/reset-password-form";
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
          <ScreenTitle className="text-center">Contraseña nueva</ScreenTitle>
          {estado === "vigente" ? <ResetPasswordForm token={token} /> : <EnlaceInvalido />}
        </div>
      </div>
    </div>
  );
}
