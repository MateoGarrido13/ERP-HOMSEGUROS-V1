import { SectionSkeleton } from "../../../components/pendientes/section-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 md:p-6">
      <h1 className="text-[26px] leading-[34px] font-semibold tracking-[-0.4px] text-title">Pendientes</h1>
      <SectionSkeleton etiqueta="avisos" />
      <SectionSkeleton etiqueta="leads" />
    </main>
  );
}
