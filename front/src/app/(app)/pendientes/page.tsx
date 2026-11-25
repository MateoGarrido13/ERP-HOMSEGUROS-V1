import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LeadBoard } from "../../../components/pendientes/lead-board";
import { PendingBoard } from "../../../components/pendientes/pending-board";
import { SectionSkeleton } from "../../../components/pendientes/section-skeleton";
import { verifySession } from "../../../lib/auth/dal";
import { inicioDelRol } from "../../../lib/auth/validation";
import { pendientesRepo } from "../../../lib/pendientes";
import { fechaHoyArgentina } from "../../../lib/pendientes/format";

// Se lee en cada carga y nunca se cachea entre usuarios (SUP-4).
export const dynamic = "force-dynamic";

function ErrorSeccion({ mensaje }: { mensaje: string }) {
  return (
    <p role="alert" className="rounded-xl border border-danger-border bg-danger-bg p-4 text-sm text-danger">
      {mensaje}
    </p>
  );
}

// Cada sección carga y falla por separado: la falla de una no oculta la otra.
async function leer<T>(nombre: string, leerDatos: () => Promise<T>): Promise<T | null> {
  try {
    return await leerDatos();
  } catch (error) {
    console.error(`[pendientes] ${nombre}`, error);
    return null;
  }
}

async function SeccionAvisos({ pasId }: { pasId: string }) {
  const avisos = await leer("avisos", () => pendientesRepo.avisosDe(pasId));
  if (!avisos) return <ErrorSeccion mensaje="No pudimos cargar los avisos. Probá de nuevo." />;
  return <PendingBoard avisos={avisos} />;
}

async function SeccionLeads({ pasId, hoy }: { pasId: string; hoy: string }) {
  const leads = await leer("leads", () => pendientesRepo.leadsDe(pasId));
  if (!leads) return <ErrorSeccion mensaje="No pudimos cargar los leads. Probá de nuevo." />;
  return <LeadBoard leads={leads} hoy={hoy} />;
}

// Solo lectura: sin Server Actions ni escrituras (CA-8). El `pasId` sale de la
// sesión, nunca de la URL.
export default async function PendientesPage() {
  const { usuarioId, rol } = await verifySession();
  if (rol !== "pas") {
    redirect(inicioDelRol(rol));
  }

  // Los días transcurridos se calculan acá, en el servidor (SUP-3).
  const hoy = fechaHoyArgentina();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 md:p-6">
      <h1 className="text-[26px] leading-[34px] font-semibold tracking-[-0.4px] text-title">Pendientes</h1>
      <Suspense fallback={<SectionSkeleton etiqueta="avisos" />}>
        <SeccionAvisos pasId={usuarioId} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton etiqueta="leads" />}>
        <SeccionLeads pasId={usuarioId} hoy={hoy} />
      </Suspense>
    </main>
  );
}
