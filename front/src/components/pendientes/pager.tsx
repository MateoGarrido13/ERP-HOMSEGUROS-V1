"use client";

import { useSyncExternalStore } from "react";

import { BrandButton } from "../ui/brand-button";

// 5 por página en mobile y 10 en desktop (PA-2). El punto de corte es el mismo
// que el del layout de escritorio: `lg` de Tailwind = 1024px (spec de layout
// de escritorio, SUP-1).
const CONSULTA_DESKTOP = "(min-width: 1024px)";

function suscribir(cb: () => void) {
  const mq = window.matchMedia(CONSULTA_DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

// El servidor (y la primera pintura) usan el tamaño mobile; el cliente lo
// ajusta al ancho real. Solo cambia cuántas filas se muestran de una lista
// que ya vino filtrada por PAS desde el servidor.
export function usePageSize(): number {
  return useSyncExternalStore(
    suscribir,
    () => (window.matchMedia(CONSULTA_DESKTOP).matches ? 10 : 5),
    () => 5,
  );
}

interface PagerProps {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
  etiqueta: string;
}

export function Pager({ pagina, totalPaginas, onChange, etiqueta }: PagerProps) {
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label={`Paginación de ${etiqueta}`} className="flex items-center justify-between gap-3 pt-1">
      <BrandButton
        variant="outline"
        className="w-auto"
        disabled={pagina <= 1}
        onClick={() => onChange(pagina - 1)}
      >
        Anterior
      </BrandButton>
      <p className="text-sm text-slate" aria-live="polite">
        Página {pagina} de {totalPaginas}
      </p>
      <BrandButton
        variant="outline"
        className="w-auto"
        disabled={pagina >= totalPaginas}
        onClick={() => onChange(pagina + 1)}
      >
        Siguiente
      </BrandButton>
    </nav>
  );
}
