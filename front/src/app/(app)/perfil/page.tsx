import { LogoutButton } from "../../../components/auth/logout-button";

// Pantalla mínima para ubicar el cierre de sesión (ERP-8). El resto del
// perfil (datos y edición) es ERP-7.
export default function PerfilPage() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-lg font-semibold">Perfil</h1>
      <LogoutButton />
    </main>
  );
}
