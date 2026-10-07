import type { AseguradoSearch } from "@/lib/asegurado-search"

export function AseguradoSummary({ asegurado }: { asegurado: AseguradoSearch }) {
  if (!asegurado.nombre && !asegurado.apellido) return null

  return (
    <div className="mt-3 border-t border-line/70 pt-3">
      <p className="text-[11px] font-medium tracking-wide text-teal-deep">ASEGURADO</p>
      <p className="mt-1 text-sm font-medium text-ink">
        {asegurado.nombre} {asegurado.apellido}
      </p>
      <p className="mt-1 text-sm font-light text-body">
        {asegurado.email} · {asegurado.telefono}
      </p>
      {asegurado.dni ? (
        <p className="mt-1 text-sm font-light text-body">DNI {asegurado.dni}</p>
      ) : null}
      {asegurado.comentarios ? (
        <p className="mt-1 text-sm font-light text-body">{asegurado.comentarios}</p>
      ) : null}
    </div>
  )
}
