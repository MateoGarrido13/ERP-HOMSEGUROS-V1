# Spec: Acceso — sesión, usuarios y auditoría (épica)

| | |
|---|---|
| **US** | ERP-5, ERP-6, ERP-7, ERP-8 (y ERP-17 en lo que toca a sesión y alcance de datos) |
| **Épica** | Acceso |
| **CU origen** | CU-01, CU-02, CU-03, CU-04 `docs/casos-de-uso/login-logout/` |
| **Tipo** | Datos/backend · Pantalla/UI |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | Yaco10 (autoaprobada, proyecto individual) |
| **Fecha** | 2026-10-31 (aprobada 2026-11-13) |

## 1. Contexto y objetivo

Las cuatro historias de Acceso y la bandeja de Pendientes comparten las mismas decisiones: cómo se guarda y valida la sesión, cómo se modelan usuarios y auditoría, cómo se protegen las rutas y cómo se limita lo que ve cada rol. Esta spec fija esas decisiones una sola vez; cada spec de US las referencia y define solo lo propio.

**Objetivo:** que exista una única capa de acceso (sesión, usuario, rol, alcance, auditoría) en `front/`, sobre Supabase (Auth + Postgres), sobre la que se construyan ERP-5, 6, 7, 8 y 17.

**Decisión de base y proveedor (2026-11-12):** se usa Supabase. Para desarrollo, el stack local vía Docker (`supabase start`, CLI de Supabase); el mismo código apunta más adelante al proyecto Supabase alojado, cambiando solo variables de entorno. El login, la recuperación de contraseña y la sesión los resuelve **Supabase Auth** directamente desde `front/` (sin backend propio intermediando): `auth.users` guarda las credenciales, no `usuario`. Si más adelante se incorpora un backend (p. ej. Go) para otra lógica de negocio, no reemplaza esto: consulta el mismo Postgres y, si necesita saber quién es el usuario, valida el JWT de Supabase — nunca maneja contraseñas. Esto resuelve SUP-2 y la mitad de PA-7 (desarrollo); la mitad de producción (cuándo y cómo se crea el proyecto alojado) sigue abierta.

## 2. Alcance

**Dentro:**
- Arquitectura de sesión y protección de rutas en Next.js.
- Interfaz `AuthProvider` y repositorios de usuarios y auditoría, con una implementación de desarrollo (datos de ejemplo).
- Modelo de datos mínimo: usuario y auditoría.
- Reglas de alcance por rol que consumen las demás pantallas.
- Estructura de rutas y layout (con menú / sin menú).

**Fuera de alcance:**
- Elegir y crear el proyecto Supabase alojado ("el Supabase original") y migrar a producción: eso sigue siendo parte del spike ERP-9. Para desarrollo, la base y el proveedor de autenticación ya están decididos (ver 4.3, 4.4 y PA-7): Supabase local vía Docker (`supabase start`), con Supabase Auth.
- Alta, edición, baja y roles de usuarios (CU-46, 47, 48).
- Pantalla de consulta de auditoría (CU-51). Acá solo se **escribe** el registro.
- Dashboard de la red (CU-40): se crea una página mínima de destino.
- Despliegue y variables de entorno de producción.

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Interfaz de autenticación | `front/src/lib/auth/provider.ts` | nuevo |
| Implementación contra Supabase | `front/src/lib/auth/provider.supabase.ts` | nuevo |
| Cliente Supabase (servidor/navegador) | `front/src/lib/supabase/server.ts`, `front/src/lib/supabase/client.ts` | nuevo |
| Esquema y seed locales | `supabase/migrations/`, `supabase/seed.sql`, `supabase/config.toml` | nuevo |
| Sesión (cookie, vía `@supabase/ssr`) | `front/src/lib/auth/session.ts` | nuevo |
| Capa de acceso a datos de sesión (DAL) | `front/src/lib/auth/dal.ts` | nuevo |
| Validaciones | `front/src/lib/auth/validation.ts` | nuevo |
| Auditoría | `front/src/lib/audit/` | nuevo |
| Tipos de dominio | `front/src/lib/auth/types.ts` | nuevo |
| Proxy (chequeo optimista) | `front/src/proxy.ts` | nuevo |
| Layout con y sin menú | `front/src/app/` (grupos de rutas) | nuevo |
| Componentes base de UI | `front/src/components/ui/` | nuevo |

## 4. Diseño

### 4.1 Flujo

Toda petición a una ruta protegida pasa por dos controles:

```
Petición ─► proxy.ts ── (1) lee solo la cookie de sesión de Supabase, sin llamar a Supabase
              │              sin cookie → redirige a /
              ▼
        Server Component / Server Action
              │ (2) dal.verifySession(): supabase.auth.getUser() valida el JWT contra
              │     Supabase y cruza con `usuario` (rol, estado); devuelve
              │     { usuarioId, rol } o redirige a /
              ▼
        Lectura/escritura de datos filtrada por rol (4.4)
```

- El **proxy** es solo un filtro rápido (así lo indica la guía de Next.js de autenticación): no es la barrera de seguridad.
- La **barrera real** es `verifySession()` en la DAL, llamada desde cada página y cada Server Action protegida. Ninguna página protegida lee datos sin pasar por ella.
- Las mutaciones (ingresar, salir, cambiar contraseña, guardar perfil) son **Server Actions** que llaman a Supabase Auth directamente (`front/src/lib/auth/provider.supabase.ts`). No se exponen endpoints REST propios para esto, y no hay backend propio en el medio.

### 4.2 Pantallas y estados

Rutas (se conservan las del prototipo):

| Ruta | Pantalla | Menú | Spec |
|---|---|---|---|
| `/` | Ingreso | no | ERP-5 |
| `/recuperar` | Pedir enlace de recuperación | no | ERP-6 |
| `/recuperar/nueva` | Elegir contraseña nueva (llega con el enlace) | no | ERP-6 |
| `/perfil` | Ver/editar perfil, entrada a "Cambiar contraseña" y "Cerrar sesión" | sí | ERP-7, ERP-8 |
| `/perfil/contrasena` | Cambiar contraseña con sesión | sí | ERP-6 |
| `/pendientes` | Bandeja del PAS | sí | ERP-17 |
| `/red` | Destino del directivo/administrativo (página mínima hasta CU-40) | sí | esta spec |

- Dos grupos de rutas en `src/app/`: `(publico)` (sin menú) y `(app)` (con menú y chequeo de sesión en su `layout`).
- El menú depende del rol: PAS = Cotizar, Cartera, Pendientes, Siniestros, Perfil; directivo/administrativo = Red, Perfil (igual que el prototipo, `prototype/src/lib/navigation.ts`). Solo se muestran los ítems cuyas pantallas ya existen.
- Estados comunes de formulario: inicial, enviando (botón deshabilitado), error de campo, error general, éxito.
- Referencia de diseño: prototipo `prototype/src/components/auth/` y Figma (fileKey `dqM3vmFc3i8F3FyKIqiXvD`).

### 4.3 Modelo de datos

| Entidad | Campos (tipo) | Relaciones | Notas |
|---|---|---|---|
| `usuario` | `id` uuid (= `auth.users.id`, FK 1:1), `email` texto único (en minúscula), `nombre` texto, `apellido` texto, `dni` entero, `telefono` texto, `rol` enum(`pas`,`directivo`,`administrativo`), `organizacion` texto, `estado` enum(`activo`,`suspendido`) | `id` → `auth.users.id` (`on delete cascade`) | Sin columna `matricula` (PA-9): para el PAS vive en `productor.matricula_ssn` (`sql/schema/schema.sql`), se lee con JOIN por `id`; los demás roles no tienen fila en `productor`, así que no tienen matrícula (SUP-3) sin necesidad de un campo nulo. `apellido` y `dni` vienen de `sql/schema/schema.sql` y quedan obligatorios para los tres roles (PA-9); donde esta épica habla de un solo campo `nombre` (ej. pantallas de login/perfil), se compone como `nombre` + `apellido` al leer. La baja: ver PA-4 |
| `auditoria` | `id` uuid, `usuario_id` uuid, `rol` enum, `accion` enum(`ingreso`,`cierre`,`cambio-contrasena`,`perfil`), `ocurrido_en` timestamptz | `usuario_id` → `usuario.id` | Solo se agrega, nunca se edita ni se borra. Nunca guarda contraseñas ni tokens |

- La contraseña **no** es un campo de `usuario`: vive en `auth.users`, tabla propia de Supabase Auth, fuera de nuestro esquema de aplicación.
- **Entornos:** una sola implementación (`provider.supabase.ts`) en todos los entornos. En desarrollo apunta a la instancia local (`supabase start`, Docker) con las tres cuentas de ejemplo del prototipo (PAS, directivo, administrativo) creadas como usuarios reales de Supabase Auth vía `supabase/seed.sql`, nunca con esas contraseñas en producción. Cuando exista el proyecto alojado, se cambian las variables de entorno (`SUPABASE_URL`, claves); no hay que tocar pantallas, acciones ni `provider.ts`.
- **Pendiente de reconciliar** (PA-8): `sql/schema/schema.sql` todavía modela `usuario` con `id INTEGER` y una columna `password`, pensado para un esquema propio con RLS vía `SET LOCAL app.*`. Ese archivo es el esquema de cartera/pólizas (AGENTS.md ya señala que hay "dos esquemas... no reconciliados"); al adoptar Supabase Auth, su `usuario.id` tiene que pasar a `uuid` igual a `auth.users.id`, se borra `usuario.password`, y las políticas de esa tabla se reescriben contra `auth.uid()` en lugar de `SET LOCAL`. Las demás tablas (`productor`, `asegurado`, `poliza`, ...) no cambian de forma, solo seguirían la cadena de claves desde el nuevo `usuario.id`. Este cambio no se hace en esta spec: queda como pregunta abierta (PA-8) porque afecta un esquema que no es solo de Acceso.

### 4.4 Contratos

Interfaz que implementa `provider.supabase.ts` sobre `@supabase/supabase-js` / `@supabase/ssr` (es la única implementación; no hay SDK de base fuera de este archivo y de los repositorios):

```ts
interface AuthProvider {
  signIn(email, password): Promise<{ ok: true; usuario } | { ok: false; motivo: 'credenciales' | 'inactiva' | 'servicio' }>
  validateSession(): Promise<{ usuarioId } | null>      // supabase.auth.getUser()
  destroySession(): Promise<void>                       // supabase.auth.signOut(), idempotente
  requestPasswordReset(email): Promise<{ enviado: boolean }>  // supabase.auth.resetPasswordForEmail; nunca revela si el email existe
  checkResetToken(token): Promise<'vigente' | 'vencido' | 'usado' | 'invalido'>
  resetPassword(token, nueva): Promise<'ok' | 'enlace-invalido' | 'igual-a-la-anterior'>
  changePassword(usuarioId, actual, nueva): Promise<'ok' | 'actual-incorrecta' | 'igual-a-la-anterior'>  // supabase.auth.updateUser({ password })
}
interface UsuarioRepo   { porId(id); actualizarPerfil(id, { nombre, telefono }) }
interface AuditoriaRepo { registrar(usuarioId, rol, accion) }
```

- No hay `createSession(usuarioId)` propio: Supabase Auth abre la sesión al autenticar y la devuelve en la misma llamada de `signIn`.
- **Sesión:** cookie gestionada por `@supabase/ssr` (`httpOnly`, `sameSite=lax`, `secure` en producción). Guarda el JWT de Supabase, no datos del usuario en texto plano; `validateSession()` lo valida contra Supabase en cada llamada, no confía en el contenido de la cookie.
- **Alcance de datos (RN del CU-01):** `verifySession()` devuelve `{ usuarioId, rol }`. Todo repositorio de datos de negocio recibe ese contexto y filtra: PAS → solo registros de su cartera (`pas_id = usuarioId`); directivo y administrativo → toda la red. El filtro vive en el repositorio, no en la pantalla. Postgres de Supabase soporta RLS: se agrega como segunda barrera (ver PA-8 sobre reconciliar las políticas de `sql/schema/schema.sql` con `auth.uid()`), no como la única.
- **Permisos por ruta:** `/pendientes`, `/cotizar`, `/cartera`, `/siniestros` son del PAS; `/red` es de directivo/administrativo; `/perfil` es de todos. Un rol en una ruta que no es suya es redirigido a su inicio.
- **Auditoría:** se registra desde el servidor, dentro de la misma Server Action que hace el cambio.
- **Mensajes de error** en español, tomados del prototipo (`prototype/src/lib/access.ts`): son parte de los criterios de aceptación de cada US.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | El ingreso es con email y contraseña; las cuentas las crea la organización. | CU-01 RN_1, RN_2 |
| RN-2 | Una cuenta suspendida o dada de baja no obtiene sesión ni enlace de recuperación. | CU-01 RN_4, CU-02 RN_5 |
| RN-3 | La sesión de un PAS alcanza solo su cartera; la del directivo y el administrativo, la red. | CU-01 RN_5 |
| RN-4 | Ingreso, cierre, cambio de contraseña y cambio de perfil quedan en auditoría con usuario, rol, fecha y hora. | CU-01 RN_6, CU-02 RN_6, CU-03, CU-04 RN_4 |
| RN-5 | Sin sesión vigente, ninguna sección del ERP se abre: se muestra el ingreso. | CU-04 RN_2 |
| RN-6 | Cada usuario ve y edita solo su propio perfil. | CU-03 RN_1 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Cookie ausente, alterada o de sesión inexistente | Se trata como sin sesión: redirige a `/`. |
| Sesión vencida con una pantalla abierta | La próxima acción del servidor redirige a `/` y no pierde el aviso de error (no muestra datos). |
| Usuario suspendido con sesión abierta | `verifySession()` la rechaza y destruye la sesión. |
| Rol en ruta de otro rol | Redirige al inicio de su rol, sin mostrar la pantalla. |
| Falla del proveedor/base | Mensaje general "No pudimos completar la operación. Probá de nuevo." No se abre sesión ni se escribe a medias. |
| Falla al escribir auditoría | La operación **no** se completa (la auditoría es parte del cambio). Ver PA-3. |
| Acción repetida (doble clic en enviar) | El botón se deshabilita mientras envía; la acción es idempotente donde corresponda (cerrar sesión). |

## 7. Criterios de aceptación verificables

- [ ] CA-1: Sin cookie de sesión, abrir `/perfil`, `/pendientes` o `/red` redirige a `/`.
- [ ] CA-2: La cookie de sesión es `httpOnly` y no contiene email, rol ni datos personales.
- [ ] CA-3: Con sesión de PAS, abrir `/red` redirige a `/pendientes`; con sesión de directivo, abrir `/pendientes` redirige a `/red`.
- [ ] CA-4: Ninguna pantalla ni acción importa el SDK de una base de datos fuera de la implementación de `AuthProvider`/repositorios (verificable con búsqueda en el código).
- [ ] CA-5: Cambiar la implementación del proveedor en `provider.ts` no requiere modificar páginas ni acciones.
- [ ] CA-6: La auditoría solo se escribe desde el servidor y ninguna fila contiene contraseñas ni tokens.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Guardar la sesión en `localStorage` (como el prototipo) | No es segura ni la lee el servidor; el prototipo es solo una referencia visual. |
| Sesión sin estado (JWT con los datos del usuario en la cookie) | No permite cerrar la sesión de un dispositivo ni suspender a un usuario con efecto inmediato (CU-04, RN-2). |
| Proteger solo con el proxy | La guía de Next.js lo desaconseja como única barrera; el proxy también corre en prefetch. |
| Endpoints REST para cada operación | Server Actions cubren el caso con menos superficie expuesta. |
| Una spec por US para sesión y modelo | Repetiría y arriesgaría contradecir decisiones compartidas (guía, "¿una spec por US o por épica?"). |
| Mantener un `provider.dev.ts` en memoria además del real | Mantener dos implementaciones se desincroniza con el tiempo. El stack local de Supabase (Docker) ya hace de entorno de desarrollo sin duplicar la lógica de `signIn`/sesión/reset. |
| Backend propio (Go u otro) intermediando el login | Supabase Auth ya resuelve inicio de sesión, recuperación y sesión; un backend en el medio reimplementaría eso. Si se incorpora Go, es para lógica de negocio ajena a Acceso. |

## 9. Supuestos

- [x] SUP-1: Las tres cuentas de ejemplo del prototipo (`prototype/src/lib/access.ts`) sirven como datos de desarrollo. → *confirmado por: Yaco10, 2026-11-13.*
- [x] SUP-2: La interfaz de 4.4 es suficiente para Supabase Auth. → *confirmado por: Yaco10, 2026-11-12 — se adopta Supabase Auth; ya no aplica revisar contra una "implementación propia" alternativa.*
- [x] SUP-3: Solo el PAS tiene matrícula (CU-03 SUP_3). → *confirmado por: Yaco10, 2026-11-13.*
- [ ] SUP-4: Un alta de PAS (CU-46) crea el `usuario` y su credencial; esta épica no lo implementa. → *confirmado por: ___*
- [x] SUP-5: La política de contraseña se delega entera en Supabase Auth (longitud mínima configurada ahí); no se agrega una regla propia adicional. Aplica sobre todo a ERP-6 (alta/recuperación); ERP-5 (login) solo valida que la contraseña no esté vacía. → *confirmado por: Yaco10, 2026-11-13.*
- [x] SUP-6: El equipo tiene Docker y la CLI de Supabase disponibles para levantar el stack local (`supabase start`). → *confirmado por: Yaco10, 2026-11-13.*

## 10. Preguntas abiertas

- [x] PA-1: Duración de la sesión y si se permiten varias sesiones abiertas por usuario (CU-01 SUP_3). → *decidido por: Yaco10, 2026-11-13 — duración/refresh por defecto de Supabase Auth; se permiten varias sesiones simultáneas por usuario (no se invalidan sesiones anteriores al iniciar una nueva). Revisable más adelante.*
- [ ] PA-2: Tope de intentos fallidos de ingreso y qué pasa al superarlo (CU-01 SUP_4). Si hay bloqueo, ¿se audita el intento fallido? El CU hoy solo audita ingresos exitosos. → *fuera de alcance de ERP-5 (ver spec de ERP-5, §2); sin límite de intentos por ahora. Queda para una historia futura. → quién decide: ___*
- [x] PA-3: Si falla el registro de auditoría, ¿la operación se cancela (propuesto) o se completa y se reintenta? → *decidido por: Yaco10, 2026-11-13 — se cancela: si falla escribir la auditoría, la operación (p. ej. el ingreso) no se completa.*
- [x] PA-4: "Dada de baja" (CU-01 RN_4 dice "se borró de la bd"): ¿la baja borra el usuario o lo marca con un estado? Afecta la auditoría histórica (`usuario_id`). → *decidido por: Yaco10, 2026-11-13 — por ahora, "dada de baja" se trata igual que `estado = suspendido` (no obtiene sesión); no se agrega un tercer estado todavía. Distinguir "suspendido temporalmente" de "baja definitiva" queda como mejora futura.*
- [x] PA-5: Quién da de alta la cuenta del directivo y del administrativo (CU-01 SUP_2). → *decidido por: Yaco10, 2026-11-13 — por ahora se crean a mano vía script/seed de Supabase (no hay pantalla de alta; CU-46/47/48 quedan fuera de esta épica). Pantalla de alta queda como trabajo futuro sin fecha.*
- [x] PA-6: ¿Se incorpora un runner de tests (Vitest) a `front/` para la lógica pura (validaciones, alcance por rol)? → *decidido por: Yaco10, 2026-11-13 — sí, se agrega Vitest.*
- [x] PA-7 (parcial): Base de datos y proveedor de autenticación para **desarrollo** → resuelto: Supabase, local vía Docker, con Supabase Auth. → *decidido por: Yaco10, 2026-11-12*
- [ ] PA-7 (resto): Cuándo se crea el proyecto Supabase alojado ("el Supabase original") y cómo se migran las migraciones locales a ese proyecto (CLI `supabase link` / `db push`, o manual). **No se puede salir a producción sin esta respuesta.** No bloquea el desarrollo local. → *quién decide: equipo*
- [x] PA-9: Al reconciliar `usuario` (PA-8), aparece una columna duplicada entre dos esquemas: `usuario.matricula` (de esta épica) y `productor.matricula_ssn` (de `sql/schema/schema.sql`) representan lo mismo para el rol PAS. También queda sin resolver si `usuario.apellido` y `usuario.dni` (existentes en `sql/schema/schema.sql`, no mencionados en 4.3 de esta épica) se mantienen fusionados en `usuario` o se separan en una tabla de identidad aparte. Detectado al implementar T-4 del plan de ERP-5; bloquea esa tarea hasta resolverse. → *decidido por: Yaco10, 2026-11-13 — `usuario` NO lleva columna `matricula`: para el PAS vive solo en `productor.matricula_ssn` (se lee con JOIN); `apellido` y `dni` se mantienen en `usuario`, obligatorios para los tres roles; el campo `nombre` de 4.3 se compone como `nombre` + `apellido` al leer, la base no cambia esas dos columnas.*
- [x] PA-8: Reconciliar `sql/schema/schema.sql` (modelo de cartera/pólizas: `usuario.id INTEGER`, `usuario.password`, RLS vía `SET LOCAL app.*`) con el modelo de `usuario` de esta épica (`id uuid` = `auth.users.id`, sin `password`, RLS vía `auth.uid()`). → *decidido por: Yaco10, 2026-11-13 — se confirma la migración: `usuario.id` pasa a `uuid` = `auth.users.id`, se borra `usuario.password`, y las políticas de esa tabla se reescriben contra `auth.uid()`. Las demás tablas (`productor`, `asegurado`, `poliza`, ...) solo siguen la cadena de FK desde el nuevo `usuario.id`. Desbloquea T-4 del plan de ERP-5.*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | Base común de ERP-5, 6, 7, 8 y 17 | |
| 2026-11-12 | Se adopta Supabase (local vía Docker, luego proyecto alojado) con Supabase Auth; login sin backend propio en el medio. Se resuelve SUP-2 y la mitad de PA-7 (desarrollo); se actualizan 2, 3, 4.1, 4.3, 4.4 y 8; se agregan SUP-6 y PA-8. | Decisión del equipo sobre la base de datos y dónde vive el login | |
| 2026-11-13 | Se resuelven SUP-1, SUP-3, SUP-5, SUP-6 y PA-1, PA-3, PA-4, PA-5, PA-6, PA-8 (ver §9 y §10). Quedan abiertas SUP-4, PA-2 y el resto de PA-7 (no bloquean el desarrollo). Estado pasa a `Aprobada`. | Revisión de spec previa a implementar ERP-5 | |
| 2026-11-13 | Se agrega y se resuelve PA-9: al implementar T-4 (migración de ERP-5) se encontró que `usuario.matricula` (esta épica) y `productor.matricula_ssn` (`sql/schema/schema.sql`) representan lo mismo, y que `usuario.apellido`/`usuario.dni` de cartera no están contemplados en el modelo 4.3 de esta épica. Se resuelve: sin `matricula` en `usuario` (se lee de `productor.matricula_ssn`); `apellido`/`dni` obligatorios para los tres roles; `nombre` de la épica se compone de `nombre` + `apellido`. Se actualiza 4.3. | Spec incompleta detectada durante la implementación; decisión tomada por el humano antes de seguir | |
