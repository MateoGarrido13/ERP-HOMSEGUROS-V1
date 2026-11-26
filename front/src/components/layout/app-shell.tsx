import Image from "next/image";
import type { ReactNode } from "react";

import type { Rol } from "../../lib/auth/types";
import { AppNav, type MenuItem } from "./app-nav";

// Épica 4.2: el menú depende del rol (PAS vs directivo/administrativo) y
// solo muestra ítems cuyas pantallas ya existen. Hoy eso es nada más que
// Pendientes (PAS), Red (directivo/administrativo) y Perfil (todos).
// Cotizar, Cartera y Siniestros se agregan cuando existan esas pantallas.
const MENU_PAS: MenuItem[] = [
  { href: "/pendientes", label: "Pendientes" },
  { href: "/perfil", label: "Perfil" },
];
const MENU_RED: MenuItem[] = [
  { href: "/red", label: "Red" },
  { href: "/perfil", label: "Perfil" },
];

// Spec de layout de escritorio: desde `lg` (1024px) el menú es lateral y la
// barra inferior desaparece; por debajo queda la barra inferior de siempre.
export function AppShell({ rol, children }: { rol: Rol; children: ReactNode }) {
  const items = rol === "pas" ? MENU_PAS : MENU_RED;

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:gap-6 lg:border-r lg:border-line lg:bg-nav lg:px-4 lg:py-5">
        <Image
          src="/hom-logo.png"
          alt="HOM, Profesionales en Seguros"
          width={216}
          height={73}
          className="h-12 w-auto self-start"
        />
        <AppNav items={items} variante="lateral" />
      </aside>
      <div className="flex min-h-dvh flex-1 flex-col lg:min-w-0">
        <main className="flex-1">{children}</main>
        <AppNav items={items} variante="inferior" />
      </div>
    </div>
  );
}
