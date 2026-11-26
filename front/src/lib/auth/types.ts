export type Rol = "pas" | "directivo" | "administrativo";

export type EstadoUsuario = "activo" | "suspendido";

export interface Usuario {
  id: string;
  email: string;
  // Nombre completo (nombre + apellido, compuestos al leer de la base: ver
  // PA-9 de la épica); apellido y dni son internos de UsuarioRepo, no se
  // exponen acá.
  nombre: string;
  // Partes del nombre completo (ERP-7): solo `nombrePila` es editable desde
  // el perfil; `apellido` queda fijo y se muestra junto al nombre.
  nombrePila: string;
  apellido: string;
  telefono: string;
  rol: Rol;
  organizacion: string;
  estado: EstadoUsuario;
  // Matrícula propia del PAS (productor.matricula_ssn); null para los demás
  // roles, que no tienen fila en `productor` (SUP-3 de la épica).
  matricula: string | null;
}

// Subconjunto de Usuario para contextos fuera del repositorio de usuarios
// (resultado de signIn, sesión): sin organizacion ni estado, que son datos
// de alcance/auditoría internos de Acceso, no de la identidad del usuario.
// La matrícula del PAS no vive en Usuario (PA-9 de la épica): se consulta
// aparte, en el repositorio de productor, cuando haga falta.
export type UsuarioPublico = Pick<Usuario, "id" | "email" | "nombre" | "telefono" | "rol">;

export type AccionAuditoria = "ingreso" | "cierre" | "cambio-contrasena" | "perfil";

export interface RegistroAuditoria {
  id: string;
  usuarioId: string;
  rol: Rol;
  accion: AccionAuditoria;
  ocurridoEn: Date;
}

export type MotivoFalloSignIn = "credenciales" | "inactiva" | "servicio";

export type ResultadoSignIn =
  | { ok: true; usuario: UsuarioPublico }
  | { ok: false; motivo: MotivoFalloSignIn };
