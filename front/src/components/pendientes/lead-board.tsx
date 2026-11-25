"use client";

import { useState } from "react";

import { leadCountLabel, paginar } from "../../lib/pendientes/format";
import type { Lead } from "../../lib/pendientes/types";
import { LeadCard } from "./lead-card";
import { Pager, usePageSize } from "./pager";

export function LeadBoard({ leads, hoy }: { leads: Lead[]; hoy: string }) {
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const tamano = usePageSize();
  const vista = paginar(leads, pagina, tamano);

  return (
    <section aria-labelledby="titulo-leads" className="flex flex-col gap-3">
      <h2 id="titulo-leads" className="text-lg font-semibold text-title">
        {leadCountLabel(leads.length)}
      </h2>
      {vista.items.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          hoy={hoy}
          abierta={abiertaId === lead.id}
          onToggle={() => setAbiertaId(abiertaId === lead.id ? null : lead.id)}
        />
      ))}
      <Pager pagina={vista.pagina} totalPaginas={vista.totalPaginas} onChange={setPagina} etiqueta="leads" />
    </section>
  );
}
