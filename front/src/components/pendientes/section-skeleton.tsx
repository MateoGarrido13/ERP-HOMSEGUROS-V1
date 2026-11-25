// Esqueleto de una sección mientras carga (spec 4.2).
export function SectionSkeleton({ etiqueta }: { etiqueta: string }) {
  return (
    <div role="status" aria-label={`Cargando ${etiqueta}`} className="flex animate-pulse flex-col gap-3">
      <div className="h-6 w-24 rounded bg-line" />
      <div className="h-28 w-full rounded-xl bg-line" />
      <div className="h-28 w-full rounded-xl bg-line" />
    </div>
  );
}
