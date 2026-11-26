# Spec: Ver la bandeja de avisos y leads (ERP-17)

| | |
|---|---|
| **US** | ERP-17 · https://garridomateosys.atlassian.net/browse/ERP-17 |
| **Épica** | Pendientes (usa sesión y alcance de [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md)) |
| **CU origen** | CU-05 `docs/casos-de-uso/PAS/pendientes/CU-05-Pendientes_Ver_Pendientes.md` |
| **Tipo** | Pantalla/UI · Datos/backend (solo lectura) |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |
| **Fecha** | 2026-10-31 (aprobada 2026-11-15) |

## 1. Contexto y objetivo

ERP-17 es **"Ver la bandeja de avisos y leads"**, es decir, ver pendientes (CU-05). Es la pantalla de inicio del PAS: le muestra qué tiene para hacer. Esta US **solo lee y muestra**. Las acciones sobre cada aviso (Resolver, WhatsApp) y sobre cada lead (editar, cotizar, reactivar, descartar) pertenecen a CU-05b a 05e y CU-08b a 08e y tendrán su propia US y spec.

**Objetivo:** que el PAS vea sus avisos y sus leads, con su cantidad y sus datos, sin ver los de otro PAS y sin que la vista modifique nada.

## 2. Alcance

**Dentro:**
- `/pendientes` con la sección de avisos y la de leads, con contadores y estados vacíos.
- Detalle de un aviso (datos, sin descripción editable) y de un lead (datos y descripción en lectura).
- Lectura filtrada por PAS en el servidor.
- Paginación de cada lista: 5 por página en mobile, 10 en desktop (PA-2).
- Tablas `aviso` y `lead` (migración de Supabase con RLS por PAS) y datos de ejemplo de desarrollo.

**Fuera de alcance:**
- Generar avisos y leads (tarea nocturna, CU-05b a 05e; transiciones en `TRANSICIONES.md`): acá se **consumen**.
- Resolver, WhatsApp, editar descripción, enviar cotización, reactivar y descartar (otras US).
- El modelo completo de cliente y póliza (CU-22 en adelante).
- Pantalla `/red` y su listado de PAS (otra US): acá el directivo y el administrativo solo son redirigidos a `/red` (PA-3).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla | `front/src/app/(app)/pendientes/page.tsx` | nueva (Server Component) |
| Tablero | `front/src/components/pendientes/pending-board.tsx`, `lead-board.tsx` | nuevos (el detalle abierto/cerrado es estado de cliente) |
| Tarjetas | `front/src/components/pendientes/notice-card.tsx`, `lead-card.tsx` | nuevos |
| Repositorio | `front/src/lib/pendientes/repo.ts`, `repo.supabase.ts` | nuevo (`PendientesRepo`; el SDK de Supabase solo vive en `repo.supabase.ts`) |
| Base de datos | `supabase/migrations/…_aviso_lead.sql`, `front/scripts/seed-supabase.mjs` | nuevo (tablas, RLS, datos de ejemplo) |
| Paginador | `front/src/components/pendientes/pager.tsx` | nuevo |
| Formato | `front/src/lib/pendientes/format.ts` | nuevo (contadores, días transcurridos, fechas) |
| Tipos | `front/src/lib/pendientes/types.ts` | nuevo |

## 4. Diseño

### 4.1 Flujo

1. El PAS llega a `/pendientes` al iniciar sesión (ERP-5) o desde el menú.
2. La página llama `verifySession()` (rol debe ser `pas`; directivo y administrativo → redirige a `/red`, PA-3).
3. `PendientesRepo.avisosDe(pasId)` y `PendientesRepo.leadsDe(pasId)` devuelven solo registros con ese `pas_id`.
4. La página muestra:
   - Título de sección con la cantidad: "1 aviso" / "N avisos" / "0 avisos".
   - Una tarjeta por aviso: `Cliente: Apellido, Nombre`, `N POLIZA: <número registrado en la compañía>`, tipo de cobertura, fecha de importancia y tipo. Más reciente primero.
   - Sección "Leads" con "1 lead" / "N leads" / "0 leads".
   - Una tarjeta por lead: origen, cliente, ramo, última modificación (`dd/mm/aaaa`) y días transcurridos.
   - Cada lista pagina de a 5 (mobile) o 10 (desktop); el tamaño lo decide el ancho de pantalla en el cliente sobre los datos ya filtrados por PAS en el servidor.
5. Al tocar una tarjeta se abre su detalle en lectura (una abierta a la vez, como el prototipo). Aviso: sus cuatro datos, sin descripción. Lead: sus datos y su descripción.
6. Los botones de acción no existen en esta US (ver §2). Cuando se implementen las otras US se montan sobre este detalle.

La página no tiene ninguna Server Action ni ejecuta escrituras (CA-8).

### 4.2 Pantallas y estados

| Pantalla / componente | Estados | Comportamiento |
|---|---|---|
| Sección de avisos | cargando (esqueleto) · con datos · vacío · error | Vacío: "0 avisos", sin tarjetas y con el mensaje "No tenés avisos por ahora.". |
| Sección de leads | cargando · con datos · vacío · error | Vacío: "0 leads", sin tarjetas y con el mensaje "No tenés leads por ahora.". Cada sección es independiente: la falla de una no oculta la otra. |
| Tarjeta de aviso | cerrada · abierta | Abierta muestra el detalle de solo lectura. |
| Tarjeta de lead | cerrada · abierta | Abierta muestra la descripción de solo lectura. |

- Textos fijos: contadores (`avisoCountLabel`, `leadCountLabel` del prototipo), "Cargado hoy", "1 día transcurrido", "N días transcurridos".
- Formato de fecha: `dd/mm/aaaa`. Días = diferencia de días calendario entre la fecha de última modificación y hoy, en zona `America/Argentina/Buenos_Aires` (SUP-3).
- Navegación: entrada por menú o redirección del ingreso. No navega a ninguna otra pantalla en esta US.
- Referencia de diseño: `prototype/src/components/pendientes/*` y `prototype/src/lib/pendientes.ts`, `leads.ts`; Figma.

### 4.3 Modelo de datos

| Entidad | Campos (tipo) | Relaciones | Notas |
|---|---|---|---|
| `aviso` | `id` uuid, `id_productor` uuid, `id_asegurado` int, `id_poliza` int, `cobertura` enum(`Hogar`,`Automotor`,`Integrales`), `tipo` enum(`pago-rechazado`,`cumpleanos`,`cotizacion-enviada`,`enviar-poliza`), `fecha_importancia` date | `id_productor` → `productor.id`; `id_asegurado` → `asegurado.id`; `id_poliza` → `poliza.id` | Solo lectura acá. La fecha la fija el tipo (CU-05 RN_4). El nombre sale de `asegurado` y el número de `poliza.numero_poliza` (el registrado en la compañía) |
| `lead` | `id` uuid, `id_productor` uuid, `cliente_nombre` texto, `ramo` texto, `origen` texto, `descripcion` texto, `actualizado_en` date | `id_productor` → `productor.id` | `origen` p. ej. "Cotización enviada", "Retiró el bien". Un lead todavía no es cliente, por eso guarda el nombre como texto |

- Los avisos se asocian a cliente y póliza por id (PA-4); `asegurado` y `poliza` ya existen en `sql/schema/schema.sql`. Las tablas `aviso` y `lead` **no existen todavía**: las crea la migración de esta US. RLS: un PAS lee solo filas con su `id_productor`.
- **Datos de ejemplo vs. reales:** el seed de desarrollo (`seed-supabase.mjs`) carga avisos y leads ficticios del prototipo para al menos dos PAS, con sus asegurados y pólizas de ejemplo. Los reales los generan los procesos de CU-05b a 05e / CU-08: esta US no los crea.

### 4.4 Contratos

```ts
interface PendientesRepo {
  avisosDe(pasId: string): Promise<Aviso[]>  // incluye cliente { apellido, nombre } y numeroPoliza
  leadsDe(pasId: string): Promise<Lead[]>
}
```
- Solo el rol `pas` consulta; el `pasId` sale de la sesión y no de la URL ni de parámetros.
- Orden (PA-1): avisos por `fecha_importancia` descendente (más reciente arriba). Leads por `actualizado_en` descendente, mismo criterio (confirmado el 2026-11-25).

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Un PAS no ve avisos ni leads de otro PAS. | CU-05 RN_1 |
| RN-2 | Un aviso tiene cliente (apellido y nombre), número de póliza, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo. | CU-05 RN_2; acta 2026-11-15 |
| RN-3 | Los tipos de aviso son Pago rechazado, Cumpleaños, Cotización enviada y Enviar póliza. | CU-05 RN_3 |
| RN-4 | La fecha de importancia la fija el tipo; el PAS no la edita. | CU-05 RN_4 |
| RN-5 | La fecha del lead se muestra `dd/mm/aaaa`; hoy = "Cargado hoy", un día = "1 día transcurrido", más = "N días transcurridos". | CU-05 RN_5 |
| RN-6 | Un aviso no tiene descripción editable. | CU-05 RN_6 |
| RN-7 | Abrir la bandeja no modifica ningún aviso ni lead. | CU-05 postcondición 1 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Sin avisos | "0 avisos" y el mensaje "No tenés avisos por ahora.", sin tarjetas; los leads se muestran igual. |
| Sin leads | "0 leads", sin tarjetas. |
| Sin avisos ni leads | Ambas secciones en cero, cada una con su mensaje de vacío y sin mensaje de error. |
| Lead modificado hoy / ayer / hace N días | "Cargado hoy" / "1 día transcurrido" / "N días transcurridos". |
| Fecha futura en un lead (dato inconsistente) | Se trata como "Cargado hoy" y no se muestran días negativos. |
| Rol directivo o administrativo en la ruta | Redirige a `/red` (PA-3). |
| Sin sesión | Redirige a `/`. |
| Falla del repositorio en una sección | Mensaje "No pudimos cargar los avisos / leads. Probá de nuevo." en esa sección; la otra se muestra. |
| Muchos registros | Paginación de 5 (mobile) o 10 (desktop) por lista (PA-2). Los avisos no resueltos siguen figurando. |

## 7. Criterios de aceptación verificables

- [x] CA-1: Tras ingresar como PAS (ERP-5) se llega a `/pendientes`. → *verificado en el navegador: el login del PAS termina en `/pendientes`.*
- [x] CA-2: Con N avisos se ve "1 aviso" si N = 1, "N avisos" si N > 1 y "0 avisos" sin tarjetas si N = 0. → *verificado en el navegador («12 avisos») y con `format.test.ts` para 0, 1 y N; el estado vacío no se recorrió en el navegador (no hay un PAS sin avisos en los datos de ejemplo).*
- [x] CA-3: Cada aviso muestra `Cliente: Apellido, Nombre`, `N POLIZA:` con el número registrado en la compañía, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo; los avisos van del más reciente al más antiguo. → *verificado en el navegador: `Cliente: Apellido, Nombre`, `N POLIZA:`, cobertura y fecha; fechas en orden descendente.*
- [x] CA-4: Con M leads se ve "1 lead" si M = 1, "M leads" si M > 1 y "0 leads" sin tarjetas si M = 0. → *verificado en el navegador («11 leads») y con `format.test.ts`.*
- [x] CA-5: Cada lead muestra origen, cliente, ramo, última modificación en `dd/mm/aaaa` y días: "Cargado hoy", "1 día transcurrido" o "N días transcurridos" según corresponda. → *verificado en el navegador: origen, cliente, ramo, `dd/mm/aaaa` y «N días transcurridos».*
- [x] CA-6: Al abrir un aviso se ven sus datos y no existe campo de descripción editable; al abrir un lead se ve su descripción en solo lectura. → *verificado en el navegador: el aviso abre sus datos sin campos editables; el lead muestra la descripción en solo lectura.*
- [x] CA-7: Con dos PAS distintos, cada uno ve únicamente sus propios avisos y leads; modificar la URL o un parámetro no permite ver los del otro. → *verificado en el navegador con dos PAS: 0 avisos en común entre ambos.*
- [x] CA-8: Abrir, cerrar y recargar la bandeja no cambia ningún dato (la pantalla no tiene Server Actions ni escrituras). → *verificado en el navegador: recargar la bandeja no dispara ningún POST.*
- [x] CA-9: Solo existen los cuatro tipos de aviso de RN-3; un tipo fuera de la lista no se muestra y se registra en el log del servidor. → *verificado con `repo.test.ts` (descarta y registra un tipo fuera de RN-3).*
- [x] CA-10: Sin sesión, `/pendientes` redirige a `/`. → *verificado: sin sesión, `/pendientes` redirige a `/`.*
- [x] CA-11: Con más de 5 registros en mobile (o más de 10 en desktop) la lista se pagina y se puede navegar entre páginas sin cambiar datos. → *verificado en el navegador: mobile 5 por página (3 páginas de avisos), escritorio 10 por página, y «Siguiente» navega sin escrituras.*
- [x] CA-12: Un directivo o administrativo que abre `/pendientes` es redirigido a `/red`. → *verificado en el navegador: el directivo que abre `/pendientes` termina en `/red`.*

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Generar los avisos al abrir la pantalla | Está fuera de la US y la arquitectura prevé una tarea programada que los inserte (borrador de arquitectura, táctica 3). |
| Mostrar los botones de acción deshabilitados | Sugiere funciones que no existen; se montan cuando sus US estén aprobadas. |
| Tablero completo como componente de cliente con datos embebidos (como el prototipo) | El filtro por PAS debe ocurrir en el servidor. El cliente solo maneja qué tarjeta está abierta. |
| Calcular los días en el navegador | Mostraría distinto según la zona horaria del dispositivo; se calcula en el servidor. |

## 9. Supuestos

- [x] SUP-1: Un aviso con tipo "Próxima renovación" no existe en esta etapa (CU-05 RN_3 lo excluye). → *confirmado por: revisión conjunta 2026-11-15 (implícito en el acta)*
- [x] SUP-2: Un cliente con varias coberturas figura en el aviso con un texto compuesto ("Automotor y Hogar") y no se desglosa. → *confirmado por: revisión conjunta 2026-11-15 (implícito en el acta)*
- [x] SUP-3: Los días transcurridos se cuentan por día calendario en la zona horaria de Argentina. → *confirmado por: revisión conjunta 2026-11-15 (implícito en el acta)*
- [x] SUP-4: Toda la información se lee en cada carga; no se cachea entre usuarios. → *confirmado por: revisión conjunta 2026-11-15 (implícito en el acta)*

## 10. Preguntas abiertas

- [x] PA-1: Orden → avisos por fecha descendente (más reciente arriba). Sin columna previa que verificar: `aviso` no existía en el esquema. → *decidió: revisión conjunta 2026-11-15*
- [x] PA-2: Los avisos no resueltos siguen figurando; paginación de 5 en mobile y 10 en desktop. → *decidió: revisión conjunta 2026-11-15*
- [x] PA-3: Directivo y administrativo ven `/red` con el listado de PAS tras el login; en `/pendientes` se los redirige a `/red`. → *decidió: revisión conjunta 2026-11-15*
- [x] PA-4: Avisos asociados a póliza y cliente por `id_asegurado` e `id_poliza`; se muestra `N POLIZA:` (número registrado en la compañía) y `Cliente: Apellido, Nombre`. → *decidió: revisión conjunta 2026-11-15*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
| 2026-11-15 | Aprobada en revisión conjunta | PA-1 orden de avisos por fecha DESC (más reciente arriba; columna por verificar contra sql/schema/schema.sql); PA-2 avisos no resueltos siguen figurando, paginación mobile 5 / desktop 10; PA-3 directivo/administrativo ven /red con listado de PAS tras login; PA-4 avisos asociados a poliza y cliente con id_cliente e id_poliza; muestra 'N POLIZA:' y 'Cliente: [Apellido],[Nombre]', N POLIZA es el registrado en la compañía | |
| 2026-11-25 | Se reconcilian secciones 2 a 6 y 9-10 con el acta del 15/11: orden DESC, paginación 5/10, redirección a `/red`, modelo con ids de cliente y póliza, repositorio sobre Supabase en vez de `repo.dev.ts`; se agregan CA-11 y CA-12 | Dejar la spec consistente antes de implementar | |
| 2026-11-26 | Los estados vacíos muestran un mensaje ("No tenés avisos por ahora." / "No tenés leads por ahora.") además del contador en cero | Decisión de Yaco10 al implementar la spec de layout de escritorio: el Figma lo muestra en mobile y escritorio | |
