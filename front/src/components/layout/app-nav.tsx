"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface MenuItem {
  href: string;
  label: string;
}

interface AppNavProps {
  items: MenuItem[];
  // "inferior": barra de mobile. "lateral": menú de escritorio.
  variante: "inferior" | "lateral";
}

// Un ítem está activo en su ruta y en las que cuelgan de ella
// (ej. /perfil/contrasena sigue marcando Perfil).
function estaActivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ items, variante }: AppNavProps) {
  const pathname = usePathname();
  const lateral = variante === "lateral";

  return (
    <nav
      aria-label="Navegación principal"
      className={
        lateral
          ? "flex flex-col gap-1"
          : "fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      }
    >
      {items.map((item) => {
        const activo = estaActivo(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={
              lateral
                ? `rounded-lg px-3 py-2.5 text-sm ${
                    activo ? "bg-nav-active font-medium text-primary" : "text-slate hover:bg-nav-active/60"
                  }`
                : `flex flex-1 items-center justify-center text-sm ${activo ? "font-medium text-primary" : "text-slate"}`
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
