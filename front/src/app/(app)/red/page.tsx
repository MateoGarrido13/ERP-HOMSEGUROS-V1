import { redirect } from "next/navigation";

import { verifySession } from "../../../lib/auth/dal";
import { inicioDelRol } from "../../../lib/auth/validation";

// Página mínima de destino para directivo/administrativo (CA-5 de ERP-5).
// CU-40 la reemplaza con el dashboard real de la red.
export default async function RedPage() {
  const { rol } = await verifySession();
  if (rol === "pas") {
    redirect(inicioDelRol(rol));
  }

  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold">Red</h1>
      <p className="text-sm text-slate">Destino de directivo y administrativo. Esta pantalla se reemplaza en CU-40.</p>
    </main>
  );
}
