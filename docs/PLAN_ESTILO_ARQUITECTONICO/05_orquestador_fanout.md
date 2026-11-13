# PROMPT 05 — Orquestador de fan-out

## Skill de lanzamiento
- **Skill:** `fanout-orchestrator` (propia) — `skills/fanout-orchestrator/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `orquestador.ts` (timeout 4 s y `allSettled`)
- **Precondición:** `00_contexto_base.md` + código de 01–04. Existe `supabase/functions/cotizar/orquestador.ts`.

## Tarea
Completá **solo** `supabase/functions/cotizar/orquestador.ts`.

`Orquestador.cotizarEnParalelo(solicitud)`:

1. Crea un `AbortController`
2. Programa `abort()` a **4000 ms**
3. Llama `proveedor.cotizar(solicitud, controller.signal)` para **cada** `IProveedorACL` del constructor
4. Espera con `Promise.allSettled` — **nunca** `Promise.all`
5. Mapea cada resultado:
   - `fulfilled` → el array `CotizacionCanonica[]` devuelto por el proveedor (uno o más planes)
   - `rejected` → un solo `CotizacionCanonica` con `prima: 0`, `error` = mensaje, `proveedorId` si se puede inferir; si no, `"desconocido"`, `estimado: true`
6. Aplana (flat) todos los arrays en un solo `CotizacionCanonica[]`
7. En `finally`, `clearTimeout` del timer

El orquestador no importa HTTP, CB ni mappers. Timeout global de fan-out: 4 segundos (ADR-004).

## Output esperado
Fan-out paralelo con comparativa parcial si un proveedor falla o no llega.

## Criterio de aceptación
```bash
deno check supabase/functions/cotizar/orquestador.ts
```
El archivo contiene `Promise.allSettled` y `AbortController`. No contiene `Promise.all(`. No importa `acl/mappers`.
