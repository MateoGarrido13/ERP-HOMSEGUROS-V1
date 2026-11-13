# Plan: Iniciar sesión en el ERP (ERP-5)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (Aprobada, 2026-11-13) y [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md) (Aprobada, 2026-11-13) |
| **US** | ERP-5 |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Este plan construye también los cimientos compartidos de la épica (tipos, esquema y proveedor Supabase, sesión, DAL, proxy, layouts y componentes base), porque ERP-5 es la primera historia en ejecutarse. ERP-6, 7, 8 y 17 los reutilizan. Orden: lógica pura → Supabase local y proveedor → protección de rutas → UI → pulido. Una sola implementación del proveedor (`provider.supabase.ts`) en todos los entornos: local vía Docker ahora, proyecto alojado cuando exista ("el Supabase original", resto de PA-7 de la épica).

## 2. Antes de empezar

- [x] Spec de ERP-5 y spec de épica en estado `Aprobada` (2026-11-13). Quedan abiertas SUP-4, PA-2 (épica) y el resto de producción de PA-7 de la épica; no bloquean la parte de desarrollo (ver spec de la épica §9-10). **PA-8 (bloqueaba T-4) resuelta**: se confirmó migrar `usuario.id` a `uuid` = `auth.users.id` y borrar `usuario.password` (ver spec de la épica §10, PA-8).
- [ ] Rama creada: `erp-5-iniciar-sesion`
- [x] Docker y la CLI de Supabase instalados (SUP-6 de la épica, confirmado 2026-11-13); probar `supabase --version` y que Docker esté corriendo antes de T-4.
- [ ] Leer `front/node_modules/next/dist/docs/01-app/02-guides/authentication.md` y `.../01-getting-started/16-proxy.md`, y la guía de Supabase para Next.js App Router con `@supabase/ssr` (server-side auth, cookies).
- [x] PA-6 resuelta: sí, se agrega Vitest (T-1 ya no es condicional).

## 3. Tareas

### Fase 1 – Datos y lógica

- [x] **T-1 – Configurar tests de lógica pura**
  - **Qué:** agregar Vitest y script `test`.
  - **Archivos:** `front/package.json`, `front/vitest.config.mts` (nuevo)
  - **Depende de:** —
  - **Cubre:** soporte de verificación de CA-2, CA-3
  - **Verificación:** `npm run test` corre y pasa con un test vacío de ejemplo.

- [ ] **T-2 – Definir tipos de dominio**
  - **Qué:** `Rol`, `Usuario`, `UsuarioPublico`, `AccionAuditoria`, `RegistroAuditoria`, resultado del proveedor.
  - **Archivos:** `front/src/lib/auth/types.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-4, CA-5 (épica)
  - **Verificación:** `npx tsc --noEmit` sin errores.

- [ ] **T-3 – Portar validaciones**
  - **Qué:** `emailFieldError`, `phoneFieldError`, `passwordPolicyError`, `inicioDelRol(rol)`, normalización de email, con los mensajes de la spec.
  - **Archivos:** `front/src/lib/auth/validation.ts` (nuevo), `front/src/lib/auth/validation.test.ts` (nuevo)
  - **Depende de:** T-1, T-2
  - **Cubre:** CA-2
  - **Verificación:** los tests cubren vacío, formato inválido, válido y mayúsculas, comparados con `prototype/src/lib/access.ts`.

- [ ] **T-4 – Levantar Supabase local y migrar el esquema**
  - **Qué:** `supabase init` en la raíz del repo; portar `sql/schema/schema.sql` a `supabase/migrations/<timestamp>_init.sql` con los ajustes de la épica 4.3 para la tabla `usuario` (`id uuid` referenciando `auth.users.id` con `on delete cascade`, sin columna `password`) y sumar la tabla `auditoria`. La reconciliación de ambos esquemas ya está decidida (PA-8 de la épica, resuelta 2026-11-13): `usuario.id` pasa a `uuid`, se borra `password`, políticas RLS contra `auth.uid()`. `supabase/seed.sql` con las tres cuentas de ejemplo de `prototype/src/lib/access.ts`, creadas como usuarios reales de Supabase Auth (vía `supabase.auth.admin.createUser` en un script de seed, no SQL directo contra `auth.users`) y su fila correspondiente en `usuario`.
  - **Archivos:** `supabase/config.toml` (nuevo), `supabase/migrations/<timestamp>_init.sql` (nuevo, portado de `sql/schema/schema.sql`), `supabase/seed.sql` o `supabase/seed.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-4, CA-5 (épica)
  - **Verificación:** `supabase start` levanta Postgres, Auth y Studio en Docker sin error; `supabase db reset` aplica la migración y el seed; en Studio (`http://localhost:54323`) se ven las 3 cuentas en Authentication y sus filas en `usuario`.

- [ ] **T-5 – Implementar el proveedor contra Supabase**
  - **Qué:** `AuthProvider`, `UsuarioRepo`, `AuditoriaRepo` (épica 4.4) y su única implementación: `signIn` llama `supabase.auth.signInWithPassword` y traduce el resultado a `credenciales` / `inactiva` (cuenta con `usuario.estado = 'suspendido'`) / `servicio`; `validateSession` envuelve `supabase.auth.getUser()`; `destroySession` llama `supabase.auth.signOut()`. Los métodos de recuperación/cambio quedan lanzando "no implementado" hasta ERP-6. Variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) apuntando a la instancia local.
  - **Archivos:** `front/src/lib/supabase/server.ts`, `front/src/lib/supabase/client.ts` (nuevos, clientes de `@supabase/ssr`), `front/src/lib/auth/provider.ts` (nuevo, interfaz), `front/src/lib/auth/provider.supabase.ts` (nuevo), `front/src/lib/audit/repo.supabase.ts` (nuevo), `front/.env.local.example` (nuevo)
  - **Depende de:** T-2, T-3, T-4
  - **Cubre:** CA-3, CA-4, CA-6, RN-2
  - **Verificación:** contra la instancia local: test (o script) de `signIn`: ok con cuenta válida; `credenciales` con email desconocido y con contraseña errónea; `inactiva` con la cuenta suspendida del seed; `npx tsc --noEmit`; `provider.ts` (la interfaz) no importa nada de Supabase, solo `provider.supabase.ts` lo hace.

### Fase 2 – Sesión y protección

- [ ] **T-6 – DAL de sesión**
  - **Qué:** la cookie la gestiona `@supabase/ssr` (ya sale `httpOnly`, `sameSite=lax`, `secure` en producción); no se arma una cookie propia. `verifySession()` con `cache` de React que llama `supabase.auth.getUser()`, cruza con `usuario` (rol, estado) y redirige a `/` si no hay sesión o la cuenta está suspendida; `getSessionOptional()`.
  - **Archivos:** `front/src/lib/auth/session.ts` (nuevo, wrapper fino sobre el cliente de Supabase), `front/src/lib/auth/dal.ts` (nuevo)
  - **Depende de:** T-5
  - **Cubre:** CA-1, CA-2 (épica)
  - **Verificación:** con un `curl -I` a una ruta protegida sin cookie se obtiene redirección a `/` (después de T-8); inspección de la cookie de Supabase en el navegador: `HttpOnly`, contiene el JWT (no datos del usuario en claro que la app interprete directamente).

- [ ] **T-7 – Auditoría de ingreso**
  - **Qué:** helper `registrarAuditoria(usuarioId, rol, accion)` usado por las acciones.
  - **Archivos:** `front/src/lib/audit/index.ts` (nuevo)
  - **Depende de:** T-4, T-5
  - **Cubre:** CA-6 (ERP-5), CA-6 (épica)
  - **Verificación:** test/script: tras `registrarAuditoria` hay una fila con usuario, rol, acción y fecha; sin campo de contraseña.

- [ ] **T-8 – Proxy**
  - **Qué:** `proxy.ts` con chequeo optimista: sin cookie → `/`; con cookie en `/` → inicio del rol solo si se puede inferir sin consultar base (si no, la redirección la hace la página). `matcher` que excluye `_next`, estáticos y favicon.
  - **Archivos:** `front/src/proxy.ts` (nuevo)
  - **Depende de:** T-6
  - **Cubre:** CA-1 (épica), RN-5
  - **Verificación:** `npm run dev` + `curl -I localhost:3000/perfil` redirige a `/`; `/` responde 200.

### Fase 3 – Interfaz

- [ ] **T-9 – Componentes base de UI**
  - **Qué:** `TextField`, `BrandButton`, `SurfaceCard`, `ScreenTitle`, portados del prototipo con Tailwind v4 (sin importar desde `prototype/`; copiar y adaptar). Copiar `hom-logo.png` a `front/public/`.
  - **Archivos:** `front/src/components/ui/*` (nuevos), `front/public/hom-logo.png` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-1
  - **Verificación:** `npm run lint` sin errores; los componentes se ven en la pantalla de T-11.

- [ ] **T-10 – Layouts (público / app) y destinos por rol**
  - **Qué:** `(publico)/layout.tsx` sin menú; `(app)/layout.tsx` con menú por rol y `verifySession()`; páginas mínimas `(app)/pendientes/page.tsx` y `(app)/red/page.tsx` como destino (se reemplazan en ERP-17 y CU-40); guardia de ruta por rol (CA-3 épica).
  - **Archivos:** `front/src/app/(publico)/layout.tsx`, `front/src/app/(app)/layout.tsx`, `front/src/components/layout/app-shell.tsx`, `front/src/app/(app)/pendientes/page.tsx`, `front/src/app/(app)/red/page.tsx` (todos nuevos)
  - **Depende de:** T-6, T-9
  - **Cubre:** CA-3 (épica), CA-5
  - **Verificación:** `npm run build` pasa; el menú de PAS y el de directivo difieren; `/red` con sesión de PAS redirige a `/pendientes`.

- [ ] **T-11 – Pantalla y acción de ingreso**
  - **Qué:** formulario con `useActionState`; acción `iniciarSesion` según spec 4.1; redirección por rol; si hay sesión, `/` redirige.
  - **Archivos:** `front/src/app/(publico)/page.tsx` (reemplaza `front/src/app/page.tsx`), `front/src/app/(publico)/actions.ts`, `front/src/components/auth/login-form.tsx`
  - **Depende de:** T-3, T-5, T-6, T-7, T-10
  - **Cubre:** CA-1 a CA-9
  - **Verificación:** recorrido manual de los 9 CA con las cuentas de ejemplo; contraseña ausente de la URL y del HTML tras error.

### Fase 4 – Pulido

- [ ] **T-12 – Accesibilidad y estados**
  - **Qué:** `aria-invalid`/`aria-describedby` en errores, foco al primer campo con error, botón deshabilitado al enviar, `autocomplete`.
  - **Archivos:** `front/src/components/auth/login-form.tsx`, `front/src/components/ui/text-field.tsx`
  - **Depende de:** T-11
  - **Cubre:** CA-2, estados de 4.2
  - **Verificación:** navegación solo con teclado; lector de pantalla anuncia el error.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-9, T-10, T-11 |
| CA-2 | T-3, T-11, T-12 |
| CA-3 | T-5, T-11 |
| CA-4 | T-5, T-11 |
| CA-5 | T-10, T-11 |
| CA-6 | T-7, T-11 |
| CA-7 | T-8, T-11 |
| CA-8 | T-11 |
| CA-9 | T-11 |
| CA-1 a CA-6 de la épica | T-2, T-4, T-6, T-7, T-8, T-10 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| Next.js de esta versión cambia convenciones (`proxy`, `cookies()` asíncrono) | Leer las guías en `node_modules/next/dist/docs/` antes de T-6 y T-8; `npm run build` en cada fase. |
| La migración de T-4 queda incompleta o se desvía de lo acordado en PA-8 (épica) | Seguir al pie 4.3 de la épica (`usuario.id uuid`, sin `password`, RLS vía `auth.uid()`); si aparece un caso no previsto, frenar y actualizar la spec antes de seguir, no improvisarlo en el `.sql`. |
| Alguien del equipo no tiene Docker o la CLI de Supabase | Documentar la instalación en el README de `front/` antes de T-4; es un prerequisito de SUP-6 de la épica. |
| El proyecto Supabase alojado ("el Supabase original") todavía no existe | No bloquea el desarrollo: todo este plan corre contra la instancia local. Falta decidir cómo se migran las migraciones al proyecto alojado (resto de PA-7 de la épica) antes de salir a producción. |
| Copiar cuentas con contraseñas de ejemplo | Solo en `supabase/seed.sql`/seed script, con aviso; nunca datos reales ni en el proyecto alojado. |
| Deriva visual respecto de Figma | Contrastar con Figma al terminar T-11. |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
| 2026-11-13 | Antes de empezar | Spec de ERP-5 y de la épica pasan a `Aprobada`; se resuelven los supuestos/preguntas abiertas que bloqueaban (PA-8) o condicionaban el plan (SUP-6, PA-6). T-1 deja de ser condicional. |
| 2026-11-13 | Revisión del plan | Se corrige inconsistencia: spec ERP-5 §4.1 mencionaba `createSession`, que no existe (la sesión la abre `signIn` de Supabase). Se actualiza T-4 y la tabla de riesgos (§5) para sacar la referencia a PA-8 como bloqueo, ya resuelto. |
| 2026-11-13 | T-1 | Vitest agregado (`front/vitest.config.mts`, script `test`); `npm run test` corre y pasa. Se detectó una vulnerabilidad crítica preexistente en `next@16.3.8` (RCE no autenticado en la API de optimización de imágenes vía SVG, GHSA-2464-fhr4-w9xw), no relacionada con esta tarea — queda pendiente de evaluar upgrade. `front/src/lib/sanity.test.ts` es un test placeholder; se borra cuando T-3 agregue tests reales. |
