# Plan: Ver la bandeja de avisos y leads (ERP-17)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (versión aprobada: pendiente) |
| **US** | ERP-17 |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |

## 1. Resumen del enfoque

Solo lectura. Primero tipos, formato y repositorio con datos de ejemplo; luego las tarjetas y el tablero; al final casos borde (vacíos, errores, aislamiento entre PAS). Reemplaza la página mínima de `/pendientes` creada en ERP-5.

## 2. Antes de empezar

- [ ] Spec de ERP-17 en estado `Aprobada`, sin supuestos ni preguntas abiertas (hoy: SUP-1 a SUP-4, PA-1 a PA-4).
- [ ] Rama creada: `erp-17-ver-pendientes`
- [ ] **ERP-5 completado** (sesión, DAL con rol, layout, `/pendientes` mínimo).
- [ ] Datos de ejemplo de al menos dos PAS (agregar un segundo PAS al proveedor de desarrollo de ERP-5 para probar CA-7).

## 3. Tareas

### Fase 1 – Datos y lógica

- [ ] **T-1 – Tipos del dominio de pendientes**
  - **Qué:** `Aviso`, `Lead`, `TipoAviso`, `CoberturaAviso` según spec 4.3.
  - **Archivos:** `front/src/lib/pendientes/types.ts` (nuevo)
  - **Depende de:** —
  - **Cubre:** CA-3, CA-5, RN-2, RN-3
  - **Verificación:** `npx tsc --noEmit` sin errores.

- [ ] **T-2 – Formato: contadores, fechas y días transcurridos**
  - **Qué:** `avisoCountLabel`, `leadCountLabel`, `formatFecha(dd/mm/aaaa)`, `diasTranscurridosLabel(fecha, hoy)` con zona `America/Argentina/Buenos_Aires`; fecha futura → "Cargado hoy".
  - **Archivos:** `front/src/lib/pendientes/format.ts` (nuevo), `front/src/lib/pendientes/format.test.ts` (si hay tests)
  - **Depende de:** T-1
  - **Cubre:** CA-2, CA-4, CA-5, RN-5
  - **Verificación:** casos: 0, 1 y N; hoy, ayer, 10 días, fecha futura; cambio de día cerca de medianoche UTC.

- [ ] **T-3 – Repositorio con datos de ejemplo**
  - **Qué:** interfaz `PendientesRepo` y `repo.dev.ts` con los avisos y leads del prototipo (datos ficticios) asignados al PAS de ejemplo, más algunos del segundo PAS; filtra por `pasId`; descarta (y loguea) tipos de aviso desconocidos; orden provisorio de la spec.
  - **Archivos:** `front/src/lib/pendientes/repo.ts`, `front/src/lib/pendientes/repo.dev.ts` (nuevos)
  - **Depende de:** T-1, ERP-5 T-5
  - **Cubre:** CA-7, CA-9, RN-1, RN-3
  - **Verificación:** test/script: `avisosDe(pas1)` no incluye registros de `pas2` y viceversa; tipo desconocido no aparece.

### Fase 2 – Interfaz

- [ ] **T-4 – Tarjetas de aviso y de lead**
  - **Qué:** `NoticeCard` y `LeadCard` con los datos de CA-3 y CA-5; abren/cierran su detalle en solo lectura; sin botones de acción.
  - **Archivos:** `front/src/components/pendientes/notice-card.tsx`, `front/src/components/pendientes/lead-card.tsx` (nuevos)
  - **Depende de:** T-2, ERP-5 T-9
  - **Cubre:** CA-3, CA-5, CA-6, RN-6
  - **Verificación:** `npm run lint`; revisión visual contra `prototype/` y Figma; el detalle de aviso no tiene campo editable.

- [ ] **T-5 – Tableros y página**
  - **Qué:** `PendingBoard` y `LeadBoard` (cliente, solo manejan cuál tarjeta está abierta, una a la vez); página `/pendientes` como Server Component: `verifySession()` (solo `pas`), `avisosDe` y `leadsDe`, contadores y estados vacíos; secciones independientes ante error.
  - **Archivos:** `front/src/components/pendientes/pending-board.tsx`, `front/src/components/pendientes/lead-board.tsx` (nuevos), `front/src/app/(app)/pendientes/page.tsx` (reemplaza el mínimo de ERP-5)
  - **Depende de:** T-3, T-4, ERP-5 T-10
  - **Cubre:** CA-1, CA-2, CA-4, CA-8, CA-10
  - **Verificación:** ingresar como PAS → llega a `/pendientes`; sin sesión redirige a `/`; confirmar con búsqueda en el código que no hay `"use server"` ni escrituras en este módulo.

### Fase 3 – Casos borde y pulido

- [ ] **T-6 – Estados de carga, vacío y error**
  - **Qué:** esqueletos con `loading.tsx` o `Suspense` por sección; mensajes de error por sección; probar con repositorio vacío y con fallo forzado.
  - **Archivos:** `front/src/app/(app)/pendientes/loading.tsx` (nuevo), `front/src/app/(app)/pendientes/page.tsx` (modificar)
  - **Depende de:** T-5
  - **Cubre:** CA-2, CA-4, sección 6 de la spec
  - **Verificación:** con 0 avisos y 0 leads se ven "0 avisos" y "0 leads" sin tarjetas; con fallo forzado de una sección, la otra se muestra.

- [ ] **T-7 – Aislamiento entre PAS y roles**
  - **Qué:** probar con dos PAS que cada uno ve solo lo suyo; comprobar que directivo/administrativo en `/pendientes` son redirigidos a `/red` (según PA-3 una vez resuelta).
  - **Archivos:** sin cambios de código previstos (ajustes si falla); pruebas manuales documentadas en la bitácora
  - **Depende de:** T-5
  - **Cubre:** CA-7, RN-1
  - **Verificación:** ingresar con PAS 1 y PAS 2 y comparar; intentar `?pasId=` en la URL sin efecto.

## 4. Trazabilidad con la spec

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-5 |
| CA-2 | T-2, T-5, T-6 |
| CA-3 | T-1, T-4 |
| CA-4 | T-2, T-5, T-6 |
| CA-5 | T-2, T-4 |
| CA-6 | T-4 |
| CA-7 | T-3, T-7 |
| CA-8 | T-5 |
| CA-9 | T-3 |
| CA-10 | T-5 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| El modelo de cliente (PA-4) cambia el contrato del repositorio | El tipo `Aviso`/`Lead` se mantiene; solo cambia la implementación. Revisar cuando exista la spec de cartera. |
| Las US de acciones (CU-05b a 05e, CU-08x) necesitan agregar botones al detalle | Dejar el detalle como componente compuesto con un espacio para acciones, sin ponerlas ahora. |
| Zona horaria distinta entre servidor y PAS | Calcular en el servidor con zona fija (SUP-3). |
| Los datos reales aún no los genera nadie | Esta US corre con datos de ejemplo; anotar la dependencia con el proceso de generación. |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por el otro integrante

## 7. Bitácora de ejecución

| Fecha | Tarea | Nota |
|---|---|---|
