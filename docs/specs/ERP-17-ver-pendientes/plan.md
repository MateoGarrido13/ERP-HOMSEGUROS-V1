# Plan: Ver la bandeja de avisos y leads (ERP-17)


|             |                                                    |
| ----------- | -------------------------------------------------- |
| **Spec**    | [`spec.md`](spec.md) (aprobada 2026-11-15; reconciliada 2026-11-25) |
| **US**      | ERP-17                                             |
| **Estado** | En ejecución (código integrado en `integracion/acceso-pendientes`; falta la prueba manual en navegador y la validación final) |
| **Autor**   | Yaco10 con IA                                      |
| **Revisor** | —                                                  |


## 1. Resumen del enfoque

Solo lectura. Primero migración, tipos, formato y repositorio sobre Supabase con datos de ejemplo; luego las tarjetas y el tablero; al final casos borde (vacíos, errores, aislamiento entre PAS). Reemplaza la página mínima de `/pendientes` creada en ERP-5.

## 2. Antes de empezar

- [x] Spec de ERP-17 en estado `Aprobada`, sin supuestos ni preguntas abiertas (reconciliada el 2026-11-25).
- [x] Rama creada: `erp-17-ver-pendientes`
- [x] **ERP-5 completado** (sesión, DAL con rol, layout, `/pendientes` mínimo).
- [x] Datos de ejemplo de al menos dos PAS con asegurados y pólizas (se agregan al seed en T-3 para probar CA-7).



## 3. Tareas



### Fase 1 – Datos y lógica

- [x] **T-1 – Tipos del dominio de pendientes**
  - **Qué:** `Aviso` (con `cliente { apellido, nombre }` y `numeroPoliza`), `Lead`, `TipoAviso`, `CoberturaAviso` según spec 4.3.
  - **Archivos:** `front/src/lib/pendientes/types.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-3, CA-5, RN-2, RN-3
  - **Verificación:** `npx tsc --noEmit` sin errores.

- [x] **T-2 – Formato: contadores, fechas y días transcurridos**
  - **Qué:** `avisoCountLabel`, `leadCountLabel`, `formatFecha(dd/mm/aaaa)`, `diasTranscurridosLabel(fecha, hoy)` con zona `America/Argentina/Buenos_Aires`; fecha futura → "Cargado hoy"; `paginar(items, pagina, tamano)`.
  - **Archivos:** `front/src/lib/pendientes/format.ts` (nuevo), `front/src/lib/pendientes/format.test.ts` (nuevo)
  - **Depende de:** T-1
  - **Cubre:** CA-2, CA-4, CA-5, RN-5
  - **Verificación:** casos: 0, 1 y N; hoy, ayer, 10 días, fecha futura; cambio de día cerca de medianoche UTC.

- [x] **T-3 – Migración, repositorio y datos de ejemplo**
  - **Qué:** migración con las tablas `aviso` y `lead` y RLS por `id_productor`; interfaz `PendientesRepo` y `repo.supabase.ts` (único archivo que importa el SDK): filtra por `pasId`, ordena DESC, descarta (y loguea) tipos de aviso desconocidos, resuelve cliente y número de póliza; seed con avisos y leads del prototipo (datos ficticios) para dos PAS con sus asegurados y pólizas.
  - **Archivos:** `supabase/migrations/<timestamp>_aviso_lead.sql`, `front/src/lib/pendientes/repo.ts`, `front/src/lib/pendientes/repo.supabase.ts` (nuevos), `front/scripts/seed-supabase.mjs` (modificar)
  - **Depende de:** T-1, ERP-5 T-5
  - **Cubre:** CA-7, CA-9, RN-1, RN-3
  - **Verificación:** con Supabase local: `avisosDe(pas1)` no incluye registros de `pas2` y viceversa (también vía RLS con la sesión de cada uno); tipo desconocido no aparece; orden DESC. Migración reaplicable (`supabase db reset`).

### Fase 2 – Interfaz

- [x] **T-4 – Tarjetas de aviso y de lead**
  - **Qué:** `NoticeCard` (`Cliente: Apellido, Nombre`, `N POLIZA:`) y `LeadCard` con los datos de CA-3 y CA-5; abren/cierran su detalle en solo lectura; sin botones de acción.
  - **Archivos:** `front/src/components/pendientes/notice-card.tsx`, `front/src/components/pendientes/lead-card.tsx` (nuevos)
  - **Depende de:** T-2, ERP-5 T-9
  - **Cubre:** CA-3, CA-5, CA-6, RN-6
  - **Verificación:** `npm run lint`; revisión visual contra `prototype/` y Figma; el detalle de aviso no tiene campo editable.

- [x] **T-5 – Tableros y página**
  - **Qué:** `PendingBoard` y `LeadBoard` (cliente: tarjeta abierta, una a la vez, y paginación 5 mobile / 10 desktop con `Pager`); página `/pendientes` como Server Component: `verifySession()` (solo `pas`; directivo y administrativo → `/red`), `avisosDe` y `leadsDe`, contadores y estados vacíos; secciones independientes ante error.
  - **Archivos:** `front/src/components/pendientes/pending-board.tsx`, `front/src/components/pendientes/lead-board.tsx`, `front/src/components/pendientes/pager.tsx` (nuevos), `front/src/app/(app)/pendientes/page.tsx` (reemplaza el mínimo de ERP-5)
  - **Depende de:** T-3, T-4, ERP-5 T-10
  - **Cubre:** CA-1, CA-2, CA-4, CA-8, CA-10, CA-11, CA-12
  - **Verificación:** ingresar como PAS → llega a `/pendientes`; sin sesión redirige a `/`; confirmar con búsqueda en el código que no hay `"use server"` ni escrituras en este módulo.



### Fase 3 – Casos borde y pulido

- [x] **T-6 – Estados de carga, vacío y error**
  - **Qué:** esqueletos con `loading.tsx` o `Suspense` por sección; mensajes de error por sección; probar con repositorio vacío y con fallo forzado.
  - **Archivos:** `front/src/app/(app)/pendientes/loading.tsx` (nuevo), `front/src/app/(app)/pendientes/page.tsx` (modificar)
  - **Depende de:** T-5
  - **Cubre:** CA-2, CA-4, sección 6 de la spec
  - **Verificación:** con 0 avisos y 0 leads se ven "0 avisos" y "0 leads" sin tarjetas; con fallo forzado de una sección, la otra se muestra.

- [x] **T-7 – Aislamiento entre PAS y roles**
  - **Qué:** probar con dos PAS que cada uno ve solo lo suyo; comprobar que directivo/administrativo en `/pendientes` son redirigidos a `/red` (PA-3).
  - **Archivos:** sin cambios de código previstos (ajustes si falla); pruebas manuales documentadas en la bitácora
  - **Depende de:** T-5
  - **Cubre:** CA-7, CA-12, RN-1
  - **Verificación:** ingresar con PAS 1 y PAS 2 y comparar; intentar `?pasId=` en la URL sin efecto.



## 4. Trazabilidad con la spec


| Criterio de la spec | Tareas        |
| ------------------- | ------------- |
| CA-1                | T-5           |
| CA-2                | T-2, T-5, T-6 |
| CA-3                | T-1, T-4      |
| CA-4                | T-2, T-5, T-6 |
| CA-5                | T-2, T-4      |
| CA-6                | T-4           |
| CA-7                | T-3, T-7      |
| CA-8                | T-5           |
| CA-9                | T-3           |
| CA-10               | T-5           |
| CA-11               | T-2, T-5      |
| CA-12               | T-5, T-7      |




## 5. Riesgos y puntos de atención


| Riesgo                                                                         | Mitigación / cómo detectarlo                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| El modelo de cliente (PA-4) cambia el contrato del repositorio                 | El tipo `Aviso`/`Lead` se mantiene; solo cambia la implementación. Revisar cuando exista la spec de cartera. |
| Las US de acciones (CU-05b a 05e, CU-08x) necesitan agregar botones al detalle | Dejar el detalle como componente compuesto con un espacio para acciones, sin ponerlas ahora.                 |
| Zona horaria distinta entre servidor y PAS                                     | Calcular en el servidor con zona fija (SUP-3).                                                               |
| El contrato de `PendientesRepo` depende de `asegurado` y `poliza`, aún con RLS y ids uuid/int mezclados tras la reconciliación de ERP-5 | Verificar tipos de `id_productor` (uuid) y ids int en la migración de T-3. |
| Los datos reales aún no los genera nadie                                       | Esta US corre con datos de ejemplo; anotar la dependencia con el proceso de generación.                      |




## 6. Validación final

- [x] `npm run lint` sin errores
- [x] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante



## 7. Bitácora de ejecución


| Fecha | Tarea | Nota |
| ----- | ----- | ---- |
| 2026-11-25 | T-1, T-2 | Hechas primero con la spec vieja (el worktree estaba basado en main); tras cherry-pick de 3002ad7 se reconciliaron: `Aviso` pasa a `cliente { apellido, nombre }`. `npx vitest run src/lib/pendientes`: RED (módulo `./format` inexistente), luego GREEN 10/10 (0/1/N, hoy/ayer/10 días/futura, cruce de año, día de Buenos Aires vs UTC, paginación). |
| 2026-11-25 | T-3 | Migración `20261125120000_aviso_lead.sql` (tablas `aviso`/`lead`, RLS `auth.uid() = id_productor`, solo SELECT a `authenticated`, función `avisos_del_productor()` SECURITY DEFINER para resolver cliente y N° de póliza, porque las políticas de `asegurado`/`poliza` siguen atadas a `app.*`). `supabase migration up` falló por una migración remota ajena (`20261125000000`, de otro agente), así que se aplicó el archivo con psql en una transacción y se registró en `schema_migrations`; sin reset. Seed `seed-supabase.mjs` aditivo: corrido 2 veces, mismos conteos (4 usuarios; 14 avisos, 13 leads). Test `repo.test.ts` RED (módulo inexistente) -> GREEN 13/13 con format. Aislamiento con sesión real de cada usuario (script): martín 12 avisos/11 leads, sofía 2/2, directivo 0/0, ajenos 0; martín pide `id_productor` de sofía -> 0 filas; insert/delete -> `permission denied`; anon -> `permission denied`. Orden DESC verificado. |
| 2026-11-25 | T-4, T-5, T-6 | Tarjetas, tableros con `Pager` (5 mobile / 10 desktop vía `matchMedia`, SSR = 5), página Server Component con `Suspense` y error por sección, `loading.tsx`. `npx tsc --noEmit` y `npm run lint` sin errores (9 warnings previos de `provider.supabase.ts`); `grep "use server"` en los módulos de la pantalla: sin resultados. `next dev -p 3003` con cookie de sesión real por usuario: sin sesión -> 307 a `/`; martín -> "12 avisos", "11 leads", "Página 1 de 3", "Cargado hoy" y "1 día transcurrido"; con `?pasId=<otro>` mismo resultado (el parámetro se ignora); sofía -> "2 avisos", "2 leads". |
| 2026-11-25 | T-7 | Directivo y administrativo en `/pendientes`: la respuesta lleva `NEXT_REDIRECT` a `/red` (status 200 porque `loading.tsx` ya empezó a streamear; el redirect lo ejecuta el cliente). PAS no redirige. Aislamiento por RLS verificado en T-3. Prueba visual en navegador y tamaño desktop (10) no verificados en runtime. |
