import { redirect } from "next/navigation";

import { verifySession } from "../../../lib/auth/dal";
import { inicioDelRol } from "../../../lib/auth/validation";

// Página mínima de destino para el PAS (CA-5 de ERP-5). ERP-17 la reemplaza
// con la bandeja real.
export default async function PendientesPage() {
  const { rol } = await verifySession();
  if (rol !== "pas") {
    redirect(inicioDelRol(rol));
  }

  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold">Pendientes</h1>
      <p className="text-sm text-slate">Bandeja del PAS. Esta pantalla se reemplaza en ERP-17.</p>
    </main>
  );
}
