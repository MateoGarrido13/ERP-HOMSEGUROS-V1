import { redirect } from "next/navigation";

import { ProfileScreen } from "../../../components/auth/profile-screen";
import { verifySession } from "../../../lib/auth/dal";
import { UsuarioRepoSupabase } from "../../../lib/auth/provider.supabase";

// Spec ERP-7: el usuario sale siempre de la sesión (nunca de la URL), así
// que cada uno ve solo su perfil (RN-1).
export default async function PerfilPage() {
  const { usuarioId } = await verifySession();
  const usuario = await new UsuarioRepoSupabase().porId(usuarioId);
  if (!usuario) redirect("/");

  return (
    <ProfileScreen
      usuario={{
        nombrePila: usuario.nombrePila,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        rol: usuario.rol,
        organizacion: usuario.organizacion,
        matricula: usuario.matricula,
      }}
      // hrefCambiarContrasena="/perfil/contrasena" → se agrega tras el merge
      // de ERP-6, que crea esa ruta (CA-8).
    />
  );
}
