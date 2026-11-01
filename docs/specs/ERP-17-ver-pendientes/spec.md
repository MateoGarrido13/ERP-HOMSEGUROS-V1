# Spec: Ver la bandeja de avisos y leads (ERP-17)

| | |
|---|---|
| **US** | ERP-17 · https://garridomateosys.atlassian.net/browse/ERP-17 |
| **Épica** | Pendientes (usa sesión y alcance de [`../EPICA-acceso/spec.md`](../EPICA-acceso/spec.md)) |
| **CU origen** | CU-05 `docs/casos-de-uso/PAS/pendientes/CU-05-Pendientes_Ver_Pendientes.md` |
| **Tipo** | Pantalla/UI · Datos/backend (solo lectura) |
| **Estado** | Borrador |
| **Autor** | Yaco10 con IA |
| **Revisor** | — |
| **Fecha** | 2026-10-31 |

## 1. Contexto y objetivo

ERP-17 es **"Ver la bandeja de avisos y leads"**, es decir, ver pendientes (CU-05). Es la pantalla de inicio del PAS: le muestra qué tiene para hacer. Esta US **solo lee y muestra**. Las acciones sobre cada aviso (Resolver, WhatsApp) y sobre cada lead (editar, cotizar, reactivar, descartar) pertenecen a CU-05b a 05e y CU-08b a 08e y tendrán su propia US y spec.

**Objetivo:** que el PAS vea sus avisos y sus leads, con su cantidad y sus datos, sin ver los de otro PAS y sin que la vista modifique nada.

## 2. Alcance

**Dentro:**
- `/pendientes` con la sección de avisos y la de leads, con contadores y estados vacíos.
- Detalle de un aviso (datos, sin descripción editable) y de un lead (datos y descripción en lectura).
- Lectura filtrada por PAS en el servidor.
- Modelo de datos mínimo de `aviso` y `lead` para lectura y datos de ejemplo de desarrollo.

**Fuera de alcance:**
- Generar avisos y leads (tarea nocturna, CU-05b a 05e; transiciones en `TRANSICIONES.md`): acá se **consumen**.
- Resolver, WhatsApp, editar descripción, enviar cotización, reactivar y descartar (otras US).
- El modelo completo de cliente y póliza (CU-22 en adelante).
- Qué ven el directivo y el administrativo en esta ruta (PA-3).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla | `front/src/app/(app)/pendientes/page.tsx` | nueva (Server Component) |
| Tablero | `front/src/components/pendientes/pending-board.tsx`, `lead-board.tsx` | nuevos (el detalle abierto/cerrado es estado de cliente) |
| Tarjetas | `front/src/components/pendientes/notice-card.tsx`, `lead-card.tsx` | nuevos |
| Repositorio | `front/src/lib/pendientes/repo.ts`, `repo.dev.ts` | nuevo (`PendientesRepo`) |
| Formato | `front/src/lib/pendientes/format.ts` | nuevo (contadores, días transcurridos, fechas) |
| Tipos | `front/src/lib/pendientes/types.ts` | nuevo |

## 4. Diseño

### 4.1 Flujo

1. El PAS llega a `/pendientes` al iniciar sesión (ERP-5) o desde el menú.
2. La página llama `verifySession()` (rol debe ser `pas`; otro rol → redirige, ver PA-3).
3. `PendientesRepo.avisosDe(pasId)` y `PendientesRepo.leadsDe(pasId)` devuelven solo registros con ese `pas_id`.
4. La página muestra:
   - Título de sección con la cantidad: "1 aviso" / "N avisos" / "0 avisos".
   - Una tarjeta por aviso: nombre y apellido, tipo de cobertura, fecha de importancia y tipo.
   - Sección "Leads" con "1 lead" / "N leads" / "0 leads".
   - Una tarjeta por lead: origen, cliente, ramo, última modificación (`dd/mm/aaaa`) y días transcurridos.
5. Al tocar una tarjeta se abre su detalle en lectura (una abierta a la vez, como el prototipo). Aviso: sus cuatro datos, sin descripción. Lead: sus datos y su descripción.
6. Los botones de acción no existen en esta US (ver §2). Cuando se implementen las otras US se montan sobre este detalle.

La página no tiene ninguna Server Action ni ejecuta escrituras (CA-8).

### 4.2 Pantallas y estados

| Pantalla / componente | Estados | Comportamiento |
|---|---|---|
| Sección de avisos | cargando (esqueleto) · con datos · vacío · error | Vacío: "0 avisos" sin tarjetas. |
| Sección de leads | cargando · con datos · vacío · error | Vacío: "0 leads" sin tarjetas. Cada sección es independiente: la falla de una no oculta la otra. |
| Tarjeta de aviso | cerrada · abierta | Abierta muestra el detalle de solo lectura. |
| Tarjeta de lead | cerrada · abierta | Abierta muestra la descripción de solo lectura. |

- Textos fijos: contadores (`avisoCountLabel`, `leadCountLabel` del prototipo), "Cargado hoy", "1 día transcurrido", "N días transcurridos".
- Formato de fecha: `dd/mm/aaaa`. Días = diferencia de días calendario entre la fecha de última modificación y hoy, en zona `America/Argentina/Buenos_Aires` (SUP-3).
- Navegación: entrada por menú o redirección del ingreso. No navega a ninguna otra pantalla en esta US.
- Referencia de diseño: `prototype/src/components/pendientes/*` y `prototype/src/lib/pendientes.ts`, `leads.ts`; Figma.

### 4.3 Modelo de datos

| Entidad | Campos (tipo) | Relaciones | Notas |
|---|---|---|---|
| `aviso` | `id` uuid, `pas_id` uuid, `cliente_nombre` texto, `cliente_apellido` texto, `cobertura` enum(`Hogar`,`Automotor`,`Integrales`), `tipo` enum(`pago-rechazado`,`cumpleanos`,`cotizacion-enviada`,`enviar-poliza`), `fecha_importancia` date | `pas_id` → `usuario.id` | Solo lectura acá. La fecha la fija el tipo (CU-05 RN_4) |
| `lead` | `id` uuid, `pas_id` uuid, `cliente_nombre` texto, `ramo` texto, `origen` texto, `descripcion` texto, `actualizado_en` date | `pas_id` → `usuario.id` | `origen` p. ej. "Cotización enviada", "Retiró el bien" |

- Los nombres de cliente se guardan acá como texto porque la entidad `cliente` no está especificada todavía (PA-4). Cuando exista, se reemplaza por una relación sin cambiar la pantalla (el repositorio devuelve el mismo tipo).
- **Datos mock vs. reales:** `repo.dev.ts` devuelve los avisos y leads de ejemplo del prototipo asignados al PAS de ejemplo (ver épica 4.3). Datos ficticios únicamente. Los reales los generan los procesos de CU-05b a 05e / CU-08: esta US no los crea.

### 4.4 Contratos

```ts
interface PendientesRepo {
  avisosDe(pasId: string): Promise<Aviso[]>
  leadsDe(pasId: string): Promise<Lead[]>
}
```
- Solo el rol `pas` consulta; el `pasId` sale de la sesión y no de la URL ni de parámetros.
- Orden: el orden en que vienen del repositorio. Hasta resolver PA-1, ordena por fecha de importancia ascendente (avisos) y por `actualizado_en` ascendente (leads), es decir, lo más viejo primero. Es un criterio provisorio.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Un PAS no ve avisos ni leads de otro PAS. | CU-05 RN_1 |
| RN-2 | Un aviso tiene nombre y apellido, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo. | CU-05 RN_2 |
| RN-3 | Los tipos de aviso son Pago rechazado, Cumpleaños, Cotización enviada y Enviar póliza. | CU-05 RN_3 |
| RN-4 | La fecha de importancia la fija el tipo; el PAS no la edita. | CU-05 RN_4 |
| RN-5 | La fecha del lead se muestra `dd/mm/aaaa`; hoy = "Cargado hoy", un día = "1 día transcurrido", más = "N días transcurridos". | CU-05 RN_5 |
| RN-6 | Un aviso no tiene descripción editable. | CU-05 RN_6 |
| RN-7 | Abrir la bandeja no modifica ningún aviso ni lead. | CU-05 postcondición 1 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Sin avisos | "0 avisos", sin tarjetas; los leads se muestran igual. |
| Sin leads | "0 leads", sin tarjetas. |
| Sin avisos ni leads | Ambas secciones en cero, sin mensaje de error. |
| Lead modificado hoy / ayer / hace N días | "Cargado hoy" / "1 día transcurrido" / "N días transcurridos". |
| Fecha futura en un lead (dato inconsistente) | Se trata como "Cargado hoy" y no se muestran días negativos. |
| Rol distinto de PAS en la ruta | Redirige a su inicio (PA-3). |
| Sin sesión | Redirige a `/`. |
| Falla del repositorio en una sección | Mensaje "No pudimos cargar los avisos / leads. Probá de nuevo." en esa sección; la otra se muestra. |
| Muchos registros | Sin paginación en esta US (PA-2). |

## 7. Criterios de aceptación verificables

- [ ] CA-1: Tras ingresar como PAS (ERP-5) se llega a `/pendientes`.
- [ ] CA-2: Con N avisos se ve "1 aviso" si N = 1, "N avisos" si N > 1 y "0 avisos" sin tarjetas si N = 0.
- [ ] CA-3: Cada aviso muestra nombre y apellido, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo.
- [ ] CA-4: Con M leads se ve "1 lead" si M = 1, "M leads" si M > 1 y "0 leads" sin tarjetas si M = 0.
- [ ] CA-5: Cada lead muestra origen, cliente, ramo, última modificación en `dd/mm/aaaa` y días: "Cargado hoy", "1 día transcurrido" o "N días transcurridos" según corresponda.
- [ ] CA-6: Al abrir un aviso se ven sus datos y no existe campo de descripción editable; al abrir un lead se ve su descripción en solo lectura.
- [ ] CA-7: Con dos PAS distintos, cada uno ve únicamente sus propios avisos y leads; modificar la URL o un parámetro no permite ver los del otro.
- [ ] CA-8: Abrir, cerrar y recargar la bandeja no cambia ningún dato (la pantalla no tiene Server Actions ni escrituras).
- [ ] CA-9: Solo existen los cuatro tipos de aviso de RN-3; un tipo fuera de la lista no se muestra y se registra en el log del servidor.
- [ ] CA-10: Sin sesión, `/pendientes` redirige a `/`.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Generar los avisos al abrir la pantalla | Está fuera de la US y la arquitectura prevé una tarea programada que los inserte (borrador de arquitectura, táctica 3). |
| Mostrar los botones de acción deshabilitados | Sugiere funciones que no existen; se montan cuando sus US estén aprobadas. |
| Tablero completo como componente de cliente con datos embebidos (como el prototipo) | El filtro por PAS debe ocurrir en el servidor. El cliente solo maneja qué tarjeta está abierta. |
| Calcular los días en el navegador | Mostraría distinto según la zona horaria del dispositivo; se calcula en el servidor. |

## 9. Supuestos

- [ ] SUP-1: Un aviso con tipo "Próxima renovación" no existe en esta etapa (CU-05 RN_3 lo excluye). → *confirmado por: ___*
- [ ] SUP-2: Un cliente con varias coberturas figura en el aviso con un texto compuesto ("Automotor y Hogar", como el prototipo) y no se desglosa. → *confirmado por: ___*
- [ ] SUP-3: Los días transcurridos se cuentan por día calendario en la zona horaria de Argentina. → *confirmado por: ___*
- [ ] SUP-4: Toda la información se lee en cada carga; no se cachea entre usuarios. → *confirmado por: ___*

## 10. Preguntas abiertas

- [ ] PA-1: Orden de cada lista (CU-05 SUP_1). El prototipo usa el orden de carga. → *quién decide: ___*
- [ ] PA-2: Período en que figura cada aviso (CU-05 SUP_2), y por lo tanto qué avisos se consideran activos para listar. Hoy se listan todos los del PAS. ¿Hace falta paginar? → *quién decide: ___*
- [ ] PA-3: ¿El directivo y el administrativo ven esta pantalla o solo el dashboard de la red? (CU-05 SUP_3). Se propone redirigirlos a `/red`. → *quién decide: ___*
- [ ] PA-4: Modelo de `cliente`: define si `aviso` y `lead` referencian un cliente por id. Se resuelve con la spec de cartera (CU-22 a 25) y la decisión de base de datos (ERP-9). → *quién decide: ___*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-10-31 | Versión inicial | | |
