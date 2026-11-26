import { SectionSkeleton } from "../../../components/pendientes/section-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 md:p-6 lg:mx-0 lg:max-w-none lg:p-8">
      <h1 className="text-[26px] leading-[34px] font-semibold tracking-[-0.4px] text-title">Pendientes</h1>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <SectionSkeleton etiqueta="avisos" />
        <SectionSkeleton etiqueta="leads" />
      </div>
    </main>
  );
}
