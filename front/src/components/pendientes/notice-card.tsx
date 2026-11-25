import { etiquetaTipoAviso, formatFecha } from "../../lib/pendientes/format";
import type { Aviso } from "../../lib/pendientes/types";
import { SurfaceCard } from "../ui/surface-card";

interface NoticeCardProps {
  aviso: Aviso;
  abierta: boolean;
  onToggle: () => void;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium tracking-wide text-hint">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm font-medium text-title">{valor}</dd>
    </div>
  );
}

// Solo lectura (RN-6, CA-6): el detalle no tiene campos editables ni
// descripción. Las acciones de otras US se montarán debajo del detalle.
export function NoticeCard({ aviso, abierta, onToggle }: NoticeCardProps) {
  const cliente = `${aviso.cliente.apellido}, ${aviso.cliente.nombre}`;
  const idDetalle = `aviso-${aviso.id}`;

  return (
    <SurfaceCard>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={idDetalle}
        className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span className="inline-block rounded-pill bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger">
          {etiquetaTipoAviso(aviso.tipo)}
        </span>
        <span className="mt-2 block text-base font-medium text-title">Cliente: {cliente}</span>
        <span className="mt-1 block text-[13px] text-slate">N POLIZA: {aviso.numeroPoliza}</span>
        <span className="mt-1 block text-[13px] text-slate">{aviso.cobertura}</span>
        <span className="mt-3 block text-[11px] font-medium tracking-wide text-hint">FECHA DE IMPORTANCIA</span>
        <span className="mt-0.5 block text-sm font-medium text-title">{formatFecha(aviso.fechaImportancia)}</span>
      </button>
      {abierta ? (
        <dl id={idDetalle} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <Dato etiqueta="CLIENTE" valor={cliente} />
          <Dato etiqueta="N POLIZA" valor={aviso.numeroPoliza} />
          <Dato etiqueta="COBERTURA" valor={aviso.cobertura} />
          <Dato etiqueta="TIPO" valor={etiquetaTipoAviso(aviso.tipo)} />
          <Dato etiqueta="FECHA DE IMPORTANCIA" valor={formatFecha(aviso.fechaImportancia)} />
        </dl>
      ) : null}
    </SurfaceCard>
  );
}
