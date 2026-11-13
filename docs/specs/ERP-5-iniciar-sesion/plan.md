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

- [x] **T-2 – Definir tipos de dominio**
  - **Qué:** `Rol`, `Usuario`, `UsuarioPublico`, `AccionAuditoria`, `RegistroAuditoria`, resultado del proveedor.
  - **Archivos:** `front/src/lib/auth/types.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-4, CA-5 (épica)
  - **Verificación:** `npx tsc --noEmit` sin errores.

- [x] **T-3 – Portar validaciones**
  - **Qué:** `emailFieldError`, `phoneFieldError`, `passwordPolicyError`, `inicioDelRol(rol)`, normalización de email, con los mensajes de la spec.
  - **Archivos:** `front/src/lib/auth/validation.ts` (nuevo), `front/src/lib/auth/validation.test.ts` (nuevo)
  - **Depende de:** T-1, T-2
  - **Cubre:** CA-2
  - **Verificación:** los tests cubren vacío, formato inválido, válido y mayúsculas, comparados con `prototype/src/lib/access.ts`.

- [x] **T-4 – Levantar Supabase local y migrar el esquema**
  - **Qué:** `supabase init` en la raíz del repo; portar `sql/schema/schema.sql` a `supabase/migrations/<timestamp>_init.sql` con los ajustes de la épica 4.3 para la tabla `usuario` (`id uuid` referenciando `auth.users.id` con `on delete cascade`, sin columna `password`) y sumar la tabla `auditoria`. La reconciliación de ambos esquemas ya está decidida (PA-8 de la épica, resuelta 2026-11-13): `usuario.id` pasa a `uuid`, se borra `password`, políticas RLS contra `auth.uid()`. `supabase/seed.sql` con las tres cuentas de ejemplo de `prototype/src/lib/access.ts`, creadas como usuarios reales de Supabase Auth (vía `supabase.auth.admin.createUser` en un script de seed, no SQL directo contra `auth.users`) y su fila correspondiente en `usuario`.
  - **Archivos:** `supabase/config.toml`, `supabase/migrations/20261113023206_schema_actual.sql` (ya existían antes de esta sesión), `supabase/migrations/20261113023300_reconciliar_usuario_con_auth.sql` (nuevo), `front/scripts/seed-supabase.mjs` (nuevo, no `supabase/seed.sql`/`.ts` — ver bitácora)
  - **Depende de:** —
  - **Cubre:** CA-4, CA-5 (épica)
  - **Verificación:** `supabase start` levanta Postgres, Auth y Studio en Docker sin error; `supabase db reset` aplica la migración y el seed; en Studio (`http://localhost:54323`) se ven las 3 cuentas en Authentication y sus filas en `usuario`.

- [x] **T-5 – Implementar el proveedor contra Supabase**
  - **Qué:** `AuthProvider`, `UsuarioRepo`, `AuditoriaRepo` (épica 4.4) y su única implementación: `signIn` llama `supabase.auth.signInWithPassword` y traduce el resultado a `credenciales` / `inactiva` (cuenta con `usuario.estado = 'suspendido'`) / `servicio`; `validateSession` envuelve `supabase.auth.getUser()`; `destroySession` llama `supabase.auth.signOut()`. Los métodos de recuperación/cambio quedan lanzando "no implementado" hasta ERP-6. Variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) apuntando a la instancia local.
  - **Archivos:** `front/src/lib/supabase/server.ts`, `front/src/lib/supabase/client.ts` (nuevos, clientes de `@supabase/ssr`), `front/src/lib/auth/provider.ts` (nuevo, interfaz `AuthProvider` + `UsuarioRepo`), `front/src/lib/auth/provider.supabase.ts` (nuevo, ambas implementaciones), `front/src/lib/audit/repo.supabase.ts` (nuevo, interfaz + implementación de `AuditoriaRepo`); `front/.env.local.example` ya existía. También `supabase/migrations/20261113023400_auditoria_insert_propio.sql` (nuevo: ver bitácora).
  - **Depende de:** T-2, T-3, T-4
  - **Cubre:** CA-3, CA-4, CA-6, RN-2
  - **Verificación:** contra la instancia local: test (o script) de `signIn`: ok con cuenta válida; `credenciales` con email desconocido y con contraseña errónea; `inactiva` con la cuenta suspendida del seed; `npx tsc --noEmit`; `provider.ts` (la interfaz) no importa nada de Supabase, solo `provider.supabase.ts` lo hace.

### Fase 2 – Sesión y protección

- [x] **T-6 – DAL de sesión**
  - **Qué:** la cookie la gestiona `@supabase/ssr` (ya sale `httpOnly`, `sameSite=lax`, `secure` en producción); no se arma una cookie propia. `verifySession()` con `cache` de React que llama `supabase.auth.getUser()`, cruza con `usuario` (rol, estado) y redirige a `/` si no hay sesión o la cuenta está suspendida; `getSessionOptional()`.
  - **Archivos:** `front/src/lib/auth/session.ts` (nuevo, wrapper fino sobre el cliente de Supabase), `front/src/lib/auth/dal.ts` (nuevo)
  - **Depende de:** T-5
  - **Cubre:** CA-1, CA-2 (épica)
  - **Verificación:** con un `curl -I` a una ruta protegida sin cookie se obtiene redirección a `/` (después de T-8); inspección de la cookie de Supabase en el navegador: `HttpOnly`, contiene el JWT (no datos del usuario en claro que la app interprete directamente).

- [x] **T-7 – Auditoría de ingreso**
  - **Qué:** helper `registrarAuditoria(usuarioId, rol, accion)` usado por las acciones.
  - **Archivos:** `front/src/lib/audit/index.ts` (nuevo)
  - **Depende de:** T-4, T-5
  - **Cubre:** CA-6 (ERP-5), CA-6 (épica)
  - **Verificación:** test/script: tras `registrarAuditoria` hay una fila con usuario, rol, acción y fecha; sin campo de contraseña.

- [x] **T-8 – Proxy**
  - **Qué:** `proxy.ts` con chequeo optimista: sin cookie → `/`; con cookie en `/` → inicio del rol solo si se puede inferir sin consultar base (si no, la redirección la hace la página). `matcher` que excluye `_next`, estáticos y favicon.
  - **Archivos:** `front/src/proxy.ts` (nuevo)
  - **Depende de:** T-6
  - **Cubre:** CA-1 (épica), RN-5
  - **Verificación:** `npm run dev` + `curl -I localhost:3000/perfil` redirige a `/`; `/` responde 200.

### Fase 3 – Interfaz

- [x] **T-9 – Componentes base de UI**
  - **Qué:** `TextField`, `BrandButton`, `SurfaceCard`, `ScreenTitle`, portados del prototipo con Tailwind v4 (sin importar desde `prototype/`; copiar y adaptar). Copiar `hom-logo.png` a `front/public/`.
  - **Archivos:** `front/src/components/ui/*` (nuevos), `front/public/hom-logo.png` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-1
  - **Verificación:** `npm run lint` sin errores; los componentes se ven en la pantalla de T-11.

- [x] **T-10 – Layouts (público / app) y destinos por rol**
  - **Qué:** `(publico)/layout.tsx` sin menú; `(app)/layout.tsx` con menú por rol y `verifySession()`; páginas mínimas `(app)/pendientes/page.tsx` y `(app)/red/page.tsx` como destino (se reemplazan en ERP-17 y CU-40); guardia de ruta por rol (CA-3 épica).
  - **Archivos:** `front/src/app/(publico)/layout.tsx`, `front/src/app/(app)/layout.tsx`, `front/src/components/layout/app-shell.tsx`, `front/src/app/(app)/pendientes/page.tsx`, `front/src/app/(app)/red/page.tsx` (todos nuevos)
  - **Depende de:** T-6, T-9
  - **Cubre:** CA-3 (épica), CA-5
  - **Verificación:** `npm run build` pasa; el menú de PAS y el de directivo difieren; `/red` con sesión de PAS redirige a `/pendientes`.

- [x] **T-11 – Pantalla y acción de ingreso**
  - **Qué:** formulario con `useActionState`, según Figma (nodos "PAS · Login" / "PAS · Login · error"): título y subtítulo centrados, checkbox "Recordarme" (sin tildar por defecto), link "¿Olvidaste tu contraseña?" a `/recuperar`; acción `iniciarSesion` según spec 4.1, pasa `recordar` a `AuthProvider.signIn`; redirección por rol; si hay sesión, `/` redirige.
  - **Archivos:** `front/src/app/(publico)/page.tsx` (reemplaza `front/src/app/page.tsx`), `front/src/app/(publico)/actions.ts`, `front/src/components/auth/login-form.tsx`
  - **Depende de:** T-3, T-5, T-6, T-7, T-10
  - **Cubre:** CA-1 a CA-10
  - **Verificación:** recorrido manual de los 10 CA con las cuentas de ejemplo; contraseña ausente de la URL y del HTML tras error; comparación visual con Figma.

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
| CA-10 | T-5, T-11 |
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
| 2026-11-13 | T-2 | Tipos creados en `front/src/lib/auth/types.ts` (`Rol`, `EstadoUsuario`, `Usuario`, `UsuarioPublico`, `AccionAuditoria`, `RegistroAuditoria`, `ResultadoSignIn`). `UsuarioPublico` se definió sin `organizacion` ni `estado` (datos de alcance/auditoría internos, no de identidad); es una decisión de forma de tipos, no una regla de negocio. `npx tsc --noEmit` sin errores. |
| 2026-11-13 | T-3 | Validaciones portadas en `front/src/lib/auth/validation.ts` (`emailFieldError`, `phoneFieldError`, `passwordPolicyError`, `inicioDelRol`, `normalizarEmail`), idénticas a `prototype/src/lib/access.ts`. 12 tests en `validation.test.ts`, todos pasan. Se borró el placeholder `sanity.test.ts` de T-1. `npx tsc --noEmit` sin errores. |
| 2026-11-13 | T-4 (frenada) | `supabase init` y la migración base (copia literal de `sql/schema/schema.sql`) ya estaban hechos antes de esta sesión. Al armar la migración de reconciliación (PA-8) se encontró que `usuario.matricula` (épica) y `productor.matricula_ssn` (cartera) se superponen, y que `apellido`/`dni` de cartera no están en el modelo 4.3 de la épica. Se agrega PA-9 en la spec de la épica. T-4 queda frenada hasta que se resuelva; no se escribió ningún `.sql` nuevo. |
| 2026-11-13 | T-4 (completa) | PA-9 resuelto (ver spec de la épica). Migración `20261113023300_reconciliar_usuario_con_auth.sql`: `usuario.id`→uuid con FK a `auth.users`, se borra `password`, se agregan `telefono`/`rol`/`organizacion`/`estado`, sin `matricula`; `productor.id` y `asegurado.id_productor`→uuid; política RLS de `usuario` pasa a `auth.uid()`; se crea `auditoria` (sin acceso por RLS); se recrean 11 políticas de SELECT que dependían de `current_productor_id()` (ahora devuelve uuid) con el mismo cuerpo que tenían. Verificado con `supabase db reset` contra la instancia local (ya estaba corriendo) y revisión de `\\d` por `psql` dentro del contenedor. El seed quedó en `front/scripts/seed-supabase.mjs` (no `supabase/seed.sql`/`.ts`): necesita `@supabase/supabase-js` para llamar a `auth.admin.createUser`, y ese paquete solo se resuelve desde `front/node_modules` (los módulos de `supabase/` no tienen su propio `package.json`). Se agregó `@supabase/supabase-js` y `ws` como dependencias de `front/` (Node 20 no tiene `WebSocket` global, lo pide el cliente de Realtime de supabase-js aunque no se use; **riesgo para T-5**: el provider del servidor puede pegar con lo mismo). Corrida con `node --env-file=.env.local scripts/seed-supabase.mjs` desde `front/`: las 3 cuentas quedaron creadas en `auth.users` (confirmadas) y en `usuario`/`productor`, matrícula solo en la fila de `productor` del PAS. |
| 2026-11-13 | T-5 | `provider.ts` (interfaz, sin imports de Supabase — verificado con grep) + `provider.supabase.ts` (`AuthProviderSupabase`, `UsuarioRepoSupabase`) + `audit/repo.supabase.ts` (`AuditoriaRepoSupabase`) + clientes `supabase/server.ts`/`client.ts` (`@supabase/ssr`). Se agregó una migración más, `20261113023400_auditoria_insert_propio.sql`: la política de `auditoria` de T-4 denegaba todo; se cambió a permitir INSERT solo de la propia fila (`auth.uid() = usuario_id`), así `AuditoriaRepo.registrar` corre con la sesión del usuario, sin necesitar una service_role aparte. `actualizarPerfil` (UsuarioRepo) y los 4 métodos de recuperación/cambio de `AuthProvider` quedan lanzando "No implementado" (ERP-6/ERP-7), como pedía el plan. Verificado con una ruta temporal (`app/api/verify-t5-temporal`, creada y borrada en esta misma tarea) contra la instancia local con `npm run dev`: cuenta válida → `ok`; contraseña incorrecta y email inexistente → `credenciales` (mismo `error.code: invalid_credentials` de Supabase Auth en ambos casos); cuenta suspendida a mano y revertida → `inactiva`. `npx tsc --noEmit` y `npm run lint` sin errores (9 warnings de parámetros sin usar en los métodos no implementados, esperado). |
| 2026-11-13 | T-6 | `session.ts` (`getAuthUser`, wrapper fino sobre `supabase.auth.getUser()`) + `dal.ts` (`verifySession` y `getSessionOptional`, ambos con `cache` de React, cruzando con `usuario.rol`/`estado`). Se agregó el paquete `server-only` (recomendado por la guía de Next.js para este patrón de DAL). Verificado con rutas temporales (creadas y borradas en esta tarea) contra la instancia local: sin cookie → `getSessionOptional` da `null` y `verifySession` redirige a `/` (307); con cookie de una cuenta válida → ambos devuelven `{usuarioId, rol}`; suspendiendo la cuenta a mano con la sesión ya abierta → `getSessionOptional` da `null` y `verifySession` redirige a `/` **y** destruye la cookie (`Set-Cookie ...Max-Age=0`, confirmado). `tsc`, `lint` y `test` sin errores. |
| 2026-11-13 | T-7 | `front/src/lib/audit/index.ts`: `registrarAuditoria(usuarioId, rol, accion)`, wrapper sobre `AuditoriaRepoSupabase` (ya la única implementación). Verificado con una ruta temporal (creada y borrada en esta tarea): `signIn` + `registrarAuditoria('ingreso')` con la cuenta de Laura dejó una fila real en `auditoria` con `usuario_id`, `rol`, `accion` y `ocurrido_en`; la tabla no tiene columna de contraseña (confirmado con `\\d auditoria`). `tsc`, `lint` y `test` sin errores. |
| 2026-11-13 | T-8 | `front/src/proxy.ts`: chequeo optimista por presencia de cookie `sb-*-auth-token` (sin validarla contra Supabase); rutas públicas (`/`, `/recuperar`, `/recuperar/nueva`) pasan siempre; el resto redirige a `/` sin esa cookie. No infiere el rol (no hay claim propio en el JWT): en `/` con cookie no redirige, eso lo hace la página (T-11), como permite el propio punto 1 de "Qué". `matcher` excluye `_next/static`, `_next/image` y `favicon.ico`. Verificado con `npm run dev`: `/perfil` y `/pendientes` sin cookie → 307 a `/`; `/` sin cookie → 200; con una cookie real (vía ruta temporal de login, creada y borrada) `/perfil` ya no redirige (da 404 porque la página no existe aún) y `/` sigue en 200 sin redirigir. `npm run build` compila y lista el proxy (`ƒ Proxy (Middleware)`). |
| 2026-11-13 | T-9 | `front/src/components/ui/` (`TextField`, `BrandButton`, `SurfaceCard`, `ScreenTitle`), portados del prototipo y recortados a lo que usa ERP-5: `TextField` sin `TextArea`/`SelectField` ni el prop `variant` (ya estaba sin usar en el original); `BrandButton` solo variantes `primary`/`outline`; `SurfaceCard` sin `tone` ni modo clickeable; `ScreenTitle` sin el tamaño `document`. Se agregó `front/src/lib/cn.ts` (clsx + tailwind-merge) y los tokens de color de `prototype/src/app/globals.css` a `front/src/app/globals.css` (el subconjunto que usan estos 4 componentes). `front/public/hom-logo.png` copiado. Paquetes nuevos: `clsx`, `tailwind-merge`, `class-variance-authority`. Verificado visualmente con una página y una regla de proxy temporales (creadas y borradas en esta tarea): los 4 componentes se ven con los mismos colores/tipografía que el prototipo (screenshot tomado). `tsc`, `lint` y `test` sin errores. |
| 2026-11-13 | T-10 | `(publico)/layout.tsx` (sin menú), `(app)/layout.tsx` (llama `verifySession()`, renderiza `AppShell`), `components/layout/app-shell.tsx` (menú por rol: PAS → solo "Pendientes", directivo/administrativo → solo "Red", por ahora — el resto de ítems del menú de Figma, "Menú inferior" de PAS, se agregan cuando existan esas pantallas), `(app)/pendientes/page.tsx` y `(app)/red/page.tsx` (páginas mínimas, cada una redirige al inicio del rol correcto si el rol no coincide). `npm run build` compila. |
| 2026-11-13 | T-11 | `(publico)/page.tsx` (reemplaza `app/page.tsx`), `(publico)/actions.ts` (`iniciarSesion`), `components/auth/login-form.tsx`. Layout según Figma (logo, título y subtítulo centrados, checkbox "Recordarme", link a `/recuperar`, pie "Portal PAS · HOM Seguros"); se agregó DM Sans con `next/font` en `app/layout.tsx` (sin esto `--font-dm` de `globals.css` no resolvía a nada). Probado end-to-end en el navegador contra la instancia local: login válido de PAS → `/pendientes`; login válido de directivo → `/red`; sesión vigente en `/` → redirige sin pedir contraseña (CA-7); credenciales incorrectas → mensaje "Email o contraseña incorrectos." (igual que Figma); fila de auditoría real creada en cada login exitoso (CA-6). Dos bugs encontrados y corregidos en el camino: (1) el matcher de `proxy.ts` (T-8) no excluía archivos estáticos de `public/` — `hom-logo.png` quedaba bloqueado y redirigido, rompiendo `<Image>`; se agregó `.*\\..*` a la exclusión. (2) el campo email se borraba junto con la contraseña tras un error (React resetea los campos no controlados del formulario después de una Server Action); la spec pide conservar el email — se volvió controlado (`useState`) solo para ese campo. `tsc`, `lint`, `test` y `build` sin errores. | T-9 se había hecho mirando solo el prototipo; a pedido explícito, se contrasta contra Figma (fileKey `dqM3vmFc3i8F3FyKIqiXvD`, nodos "PAS · Login" y "PAS · Login · error"). Se corrigen tipografía (DM Sans, no Inter) y varios colores en `globals.css`/`screen-title.tsx`/`text-field.tsx`. Se detectan dos cosas que la spec no contemplaba: un checkbox "Recordarme" (se decide implementarlo, RN-6/CA-10 nuevas) y un texto específico bajo el campo contraseña en el error de credenciales (se decide NO implementarlo, por contradecir RN-1). Specs actualizadas (ver su propio historial). Se reabren T-5 y T-6 para el cambio de `recordar`: `AuthProvider.signIn(email, password, recordar = true)`; `front/src/lib/supabase/server.ts` (`createClient({ recordar })`) saca `maxAge`/`expires` de las cookies que escribe cuando `recordar = false` (preservando `maxAge: 0`, que es el borrado explícito de `signOut`). Verificado con una ruta temporal: `recordar:true` → `Set-Cookie` con `Max-Age`/`Expires`; `recordar:false` → sin ninguno de los dos; cuenta suspendida con `recordar:false` → `Max-Age=0` (borrado) sigue andando. `tsc`, `lint` y `test` sin errores. |
