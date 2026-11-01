# Spec: Acceso — sesión, usuarios y auditoría (épica)

| | |
|---|---|
| **US** | ERP-5, ERP-6, ERP-7, ERP-8 (y ERP-17 en lo que toca a sesión y alcance de datos) |
| **Épica** | Acceso |
| **CU origen** | CU-01, CU-02, CU-03, CU-04 `docs/casos-de-uso/login-logout/` |
| **Tipo** | Datos/backend · Pantalla/UI |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — (el otro integrante) |
| **Fecha** | 2026-10-31 |

## 1. Contexto y objetivo

Las cuatro historias de Acceso y la bandeja de Pendientes comparten las mismas decisiones: cómo se guarda y valida la sesión, cómo se modelan usuarios y auditoría, cómo se protegen las rutas y cómo se limita lo que ve cada rol. Esta spec fija esas decisiones una sola vez; cada spec de US las referencia y define solo lo propio.

**Objetivo:** que exista una única capa de acceso (sesión, usuario, rol, alcance, auditoría) en `front/`, independiente de la base de datos elegida, sobre la que se construyan ERP-5, 6, 7, 8 y 17.

## 2. Alcance

**Dentro:**
- Arquitectura de sesión y protección de rutas en Next.js.
- Interfaz `AuthProvider` y repositorios de usuarios y auditoría, con una implementación de desarrollo (datos de ejemplo).
- Modelo de datos mínimo: usuario y auditoría.
- Reglas de alcance por rol que consumen las demás pantallas.
- Estructura de rutas y layout (con menú / sin menú).

**Fuera de alcance:**
- Elegir la base de datos (spike ERP-9) y su implementación real de `AuthProvider`.
- Alta, edición, baja y roles de usuarios (CU-46, 47, 48).
- Pantalla de consulta de auditoría (CU-51). Acá solo se **escribe** el registro.
- Dashboard de la red (CU-40): se crea una página mínima de destino.
- Despliegue y variables de entorno de producción.

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Interfaz de autenticación | `front/src/lib/auth/provider.ts` | nuevo |
| Implementación de desarrollo | `front/src/lib/auth/provider.dev.ts` | nuevo |
| Sesión (cookie) | `front/src/lib/auth/session.ts` | nuevo |
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
Petición ─► proxy.ts ── (1) lee solo la cookie de sesión, sin consultar la base
              │              sin cookie → redirige a /
              ▼
        Server Component / Server Action
              │ (2) dal.verifySession(): valida la sesión contra el AuthProvider
              │     y devuelve { usuarioId, rol } o redirige a /
              ▼
        Lectura/escritura de datos filtrada por rol (4.4)
```

- El **proxy** es solo un filtro rápido (así lo indica la guía de Next.js de autenticación): no es la barrera de seguridad.
- La **barrera real** es `verifySession()` en la DAL, llamada desde cada página y cada Server Action protegida. Ninguna página protegida lee datos sin pasar por ella.
- Las mutaciones (ingresar, salir, cambiar contraseña, guardar perfil) son **Server Actions**. No se exponen endpoints REST propios para esto.

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
| `usuario` | `id` uuid, `email` texto único (en minúscula), `nombre` texto, `telefono` texto, `rol` enum(`pas`,`directivo`,`administrativo`), `matricula` texto nulo, `organizacion` texto, `estado` enum(`activo`,`suspendido`) | — | `matricula` solo se completa para PAS (SUP-3). La baja: ver PA-4 |
| `auditoria` | `id` uuid, `usuario_id` uuid, `rol` enum, `accion` enum(`ingreso`,`cierre`,`cambio-contrasena`,`perfil`), `ocurrido_en` timestamptz | `usuario_id` → `usuario.id` | Solo se agrega, nunca se edita ni se borra. Nunca guarda contraseñas ni tokens |

- La contraseña **no** es un campo de `usuario` en esta spec: su almacenamiento (hash, proveedor) es detalle del `AuthProvider`.
- **Datos mock vs. reales:** hasta que ERP-9 cierre, `provider.dev.ts` guarda usuarios y auditoría **en memoria del servidor** con las tres cuentas de ejemplo del prototipo (PAS, directivo, administrativo), con contraseñas de ejemplo solo en ese archivo y nunca en producción. Cuando se defina la base, se agrega otra implementación de la misma interfaz y se cambia en un único punto (`provider.ts`). No hay que tocar pantallas ni acciones.

### 4.4 Contratos

Interfaz que implementa cada proveedor (sin SDK de base fuera de su implementación):

```ts
interface AuthProvider {
  signIn(email, password): Promise<{ ok: true; usuario } | { ok: false; motivo: 'credenciales' | 'inactiva' | 'servicio' }>
  validateSession(sessionToken): Promise<{ usuarioId } | null>
  createSession(usuarioId): Promise<sessionToken>
  destroySession(sessionToken): Promise<void>           // idempotente
  requestPasswordReset(email): Promise<{ enviado: boolean }>  // nunca revela si el email existe
  checkResetToken(token): Promise<'vigente' | 'vencido' | 'usado' | 'invalido'>
  resetPassword(token, nueva): Promise<'ok' | 'enlace-invalido' | 'igual-a-la-anterior'>
  changePassword(usuarioId, actual, nueva): Promise<'ok' | 'actual-incorrecta' | 'igual-a-la-anterior'>
}
interface UsuarioRepo   { porId(id); actualizarPerfil(id, { nombre, telefono }) }
interface AuditoriaRepo { registrar(usuarioId, rol, accion) }
```

- **Sesión:** cookie `httpOnly`, `sameSite=lax`, `secure` en producción, ruta `/`. Contiene un identificador opaco de sesión (no datos del usuario).
- **Alcance de datos (RN del CU-01):** `verifySession()` devuelve `{ usuarioId, rol }`. Todo repositorio de datos de negocio recibe ese contexto y filtra: PAS → solo registros de su cartera (`pas_id = usuarioId`); directivo y administrativo → toda la red. El filtro vive en el repositorio, no en la pantalla. Si la base elegida soporta políticas por fila, se agregan como segunda barrera, no como la única.
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
| Acoplar las pantallas a Supabase desde ya | La base no está decidida (ERP-9). La interfaz permite adoptarla sin rehacer nada. |
| Una spec por US para sesión y modelo | Repetiría y arriesgaría contradecir decisiones compartidas (guía, "¿una spec por US o por épica?"). |

## 9. Supuestos

- [ ] SUP-1: Las tres cuentas de ejemplo del prototipo (`prototype/src/lib/access.ts`) sirven como datos de desarrollo. → *confirmado por: ___*
- [ ] SUP-2: La interfaz de 4.4 es suficiente para Supabase Auth y para una implementación propia; se revisa cuando ERP-9 cierre. → *confirmado por: ___*
- [ ] SUP-3: Solo el PAS tiene matrícula (CU-03 SUP_3). → *confirmado por: ___*
- [ ] SUP-4: Un alta de PAS (CU-46) crea el `usuario` y su credencial; esta épica no lo implementa. → *confirmado por: ___*
- [ ] SUP-5: La política de contraseña es "mínimo 8 caracteres con al menos un número, distinta de la anterior" (viene del prototipo; el CU la deja como supuesto). → *confirmado por: ___*

## 10. Preguntas abiertas

- [ ] PA-1: Duración de la sesión y si se permiten varias sesiones abiertas por usuario (CU-01 SUP_3). → *quién decide: ___*
- [ ] PA-2: Tope de intentos fallidos de ingreso y qué pasa al superarlo (CU-01 SUP_4). Si hay bloqueo, ¿se audita el intento fallido? El CU hoy solo audita ingresos exitosos. → *quién decide: ___*
- [ ] PA-3: Si falla el registro de auditoría, ¿la operación se cancela (propuesto) o se completa y se reintenta? → *quién decide: ___*
- [ ] PA-4: "Dada de baja" (CU-01 RN_4 dice "se borró de la bd"): ¿la baja borra el usuario o lo marca con un estado? Afecta la auditoría histórica (`usuario_id`). → *quién decide: ___*
- [ ] PA-5: Quién da de alta la cuenta del directivo y del administrativo (CU-01 SUP_2). → *quién decide: ___*
- [ ] PA-6: ¿Se incorpora un runner de tests (Vitest) a `front/` para la lógica pura (validaciones, alcance por rol)? Hoy el `package.json` no tiene tests. Se propone que sí. → *quién decide: ___*
- [ ] PA-7: Base de datos y proveedor de autenticación (spike ERP-9). Esta spec funciona con la implementación de desarrollo, pero **no se puede salir a producción sin esta respuesta**. → *quién decide: equipo, vía ERP-9*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | Base común de ERP-5, 6, 7, 8 y 17 | |
