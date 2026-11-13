import Link from "next/link";
import type { ReactNode } from "react";

import type { Rol } from "../../lib/auth/types";

interface MenuItem {
  href: string;
  label: string;
}

// Épica 4.2: el menú depende del rol (PAS vs directivo/administrativo) y
// solo muestra ítems cuyas pantallas ya existen. Hoy eso es nada más que
// Pendientes (PAS) y Red (directivo/administrativo); el resto (Cotizar,
// Cartera, Siniestros, Perfil) se agrega cuando existan esas pantallas.
const MENU_PAS: MenuItem[] = [{ href: "/pendientes", label: "Pendientes" }];
const MENU_RED: MenuItem[] = [{ href: "/red", label: "Red" }];

export function AppShell({ rol, children }: { rol: Rol; children: ReactNode }) {
  const items = rol === "pas" ? MENU_PAS : MENU_RED;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">{children}</main>
      <nav className="flex border-t border-line bg-white">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 py-3 text-center text-sm text-slate"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
