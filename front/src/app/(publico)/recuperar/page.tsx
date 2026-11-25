import Image from "next/image";

import { RecoverForm } from "../../../components/auth/recover-form";
import { ScreenTitle } from "../../../components/ui/screen-title";

export default function RecuperarPage() {
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
          <div className="flex flex-col gap-2">
            <ScreenTitle className="text-center">Recuperar contraseña</ScreenTitle>
            <p className="text-center text-sm leading-snug text-slate">
              Ingresá tu email y te mandamos un enlace para elegir una contraseña nueva.
            </p>
          </div>
          <RecoverForm />
        </div>
      </div>
    </div>
  );
}
