import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  // Enlace "Volver" arriba a la izquierda del panel derecho (solo escritorio).
  volver?: boolean;
  // El login muestra el pie también en mobile; el resto solo en escritorio.
  pieEnMobile?: boolean;
}

// Contenedor de las pantallas sin sesión.
// - Mobile (base y `sm:`): igual que antes. Figma define el frame móvil
//   (390×844): ocupa todo el alto, y desde `sm:` se centra como tarjeta de
//   ancho fijo (feedback del 2026-11-13).
// - Escritorio (`lg:`, 1024px; spec de layout de escritorio): dos paneles
//   iguales. A la izquierda marca y mensaje (sin imagen, PA-1); a la derecha
//   el formulario centrado de 360px con el pie abajo.
export function AuthShell({ children, volver = false, pieEnMobile = false }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-white sm:items-center sm:justify-center sm:bg-stage sm:px-4 sm:py-8 lg:flex-row lg:items-stretch lg:justify-start lg:bg-white lg:p-0">
      <aside className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-brand-panel">
        <p className="text-sm text-hint">Bienvenido al Portal PAS</p>
      </aside>
      <div className="relative flex min-h-dvh w-full flex-1 flex-col bg-white px-6 pt-8 pb-6 sm:min-h-0 sm:max-w-[390px] sm:flex-none lg:min-h-dvh lg:w-1/2 lg:max-w-none lg:flex-1 lg:py-0">
        {volver ? (
          <Link
            href="/"
            className="hidden items-center gap-1 text-sm text-slate hover:text-title lg:absolute lg:top-4 lg:left-4 lg:flex"
          >
            <span aria-hidden="true">‹</span> Volver
          </Link>
        ) : null}
        <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-[360px] lg:flex-none lg:justify-center lg:py-16 lg:my-auto">
          <Image
            src="/hom-logo.png"
            alt="HOM, Profesionales en Seguros"
            width={216}
            height={73}
            priority
            className="mx-auto h-16 w-auto"
          />
          <div className="mx-auto mt-8 flex w-full flex-1 flex-col gap-5 sm:flex-none">
            {children}
          </div>
        </div>
        <p
          className={`text-center text-xs text-hint ${
            pieEnMobile
              ? "mt-auto pt-10 sm:mt-10 sm:pt-0 lg:mt-0 lg:pb-6"
              : "hidden lg:block lg:pb-6"
          }`}
        >
          Portal PAS · HOM Seguros
        </p>
      </div>
    </div>
  );
}
