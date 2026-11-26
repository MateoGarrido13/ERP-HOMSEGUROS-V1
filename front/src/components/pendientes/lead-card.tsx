import { diasTranscurridosLabel, formatFecha } from "../../lib/pendientes/format";
import type { Lead } from "../../lib/pendientes/types";
import { SurfaceCard } from "../ui/surface-card";

interface LeadCardProps {
  lead: Lead;
  // Día de hoy en Buenos Aires (aaaa-mm-dd), calculado en el servidor.
  hoy: string;
  abierta: boolean;
  onToggle: () => void;
}

// Solo lectura (CA-6): el detalle muestra la descripción como texto, sin
// campo editable. Editar, cotizar, reactivar y descartar son otras US.
export function LeadCard({ lead, hoy, abierta, onToggle }: LeadCardProps) {
  const idDetalle = `lead-${lead.id}`;

  return (
    <SurfaceCard>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={idDetalle}
        className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span className="inline-block rounded-pill bg-stage px-2.5 py-0.5 text-xs font-medium text-slate">
          {lead.origen}
        </span>
        <span className="mt-2 block text-base font-medium text-title">{lead.clienteNombre}</span>
        <span className="mt-1 block text-[13px] text-slate">{lead.ramo}</span>
        <span className="mt-3 block text-[11px] font-medium tracking-wide text-hint">ÚLTIMA MODIFICACIÓN</span>
        <span className="mt-0.5 block text-sm font-medium text-title">{formatFecha(lead.actualizadoEn)}</span>
        <span className="mt-1 block text-[13px] text-primary-deep">{diasTranscurridosLabel(lead.actualizadoEn, hoy)}</span>
      </button>
      {abierta ? (
        <div id={idDetalle} className="mt-4 border-t border-line pt-4">
          <p className="text-[11px] font-medium tracking-wide text-hint">DESCRIPCIÓN</p>
          <p className="mt-1 text-sm whitespace-pre-line text-slate">{lead.descripcion || "Sin descripción."}</p>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
