"use client";

import { useState } from "react";

import { avisoCountLabel, paginar } from "../../lib/pendientes/format";
import type { Aviso } from "../../lib/pendientes/types";
import { NoticeCard } from "./notice-card";
import { Pager, usePageSize } from "./pager";

// El cliente solo maneja qué tarjeta está abierta y la página visible; los
// avisos ya llegan filtrados por PAS y ordenados desde el servidor.
export function PendingBoard({ avisos }: { avisos: Aviso[] }) {
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const tamano = usePageSize();
  const vista = paginar(avisos, pagina, tamano);

  return (
    <section aria-labelledby="titulo-avisos" className="flex flex-col gap-3">
      <h2 id="titulo-avisos" className="text-lg font-semibold text-title">
        {avisoCountLabel(avisos.length)}
      </h2>
      {vista.items.length === 0 ? (
        <p className="rounded-xl bg-disabled px-4 py-6 text-center text-sm text-slate">
          No tenés avisos por ahora.
        </p>
      ) : null}
      {vista.items.map((aviso) => (
        <NoticeCard
          key={aviso.id}
          aviso={aviso}
          abierta={abiertaId === aviso.id}
          onToggle={() => setAbiertaId(abiertaId === aviso.id ? null : aviso.id)}
        />
      ))}
      <Pager pagina={vista.pagina} totalPaginas={vista.totalPaginas} onChange={setPagina} etiqueta="avisos" />
    </section>
  );
}
