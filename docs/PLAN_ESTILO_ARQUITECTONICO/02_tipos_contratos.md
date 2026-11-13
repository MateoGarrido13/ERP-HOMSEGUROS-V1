# PROMPT 02 — Tipos y contratos entre capas

## Skill de lanzamiento
- **Skill:** `canonical-types` (propia) — `skills/canonical-types/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `types.ts` (exports y contratos)
- **Precondición:** `00_contexto_base.md` + esqueleto del paso 01. Existe `supabase/functions/_shared/types.ts`.

## Tarea
Completá **solo** `supabase/functions/_shared/types.ts`. Ningún otro archivo.

El archivo es la fuente de verdad de contratos entre capas. Debe exportar:

- `SolicitudCotizacion` y `CotizacionCanonica` — copiadas del contexto base, sin campos extra
- `IProveedorACL` — un método: `cotizar(solicitud: SolicitudCotizacion, signal: AbortSignal): Promise<CotizacionCanonica[]>` (uno o más planes por proveedor)
- `ICircuitBreaker` — `isOpen(): boolean`, `recordSuccess(): void`, `recordFailure(): void`
- `CircuitBreakerOpciones` — `{ umbralFallas: number; ventanaMs: number; tiempoRecuperacionMs: number }`
- `AppError` — clase que extiende `Error` con `readonly code: string`

No agregues tipos de un proveedor concreto. No agregues JWT ni filas de BD.

## Output esperado
Un archivo TypeScript que compile con `deno check supabase/functions/_shared/types.ts`.

## Criterio de aceptación
```bash
deno check supabase/functions/_shared/types.ts
```
Todos los símbolos de la lista están exportados. No hay tipos de Sancor, Zurich ni Auth.
