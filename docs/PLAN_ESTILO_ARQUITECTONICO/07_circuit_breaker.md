# PROMPT 07 — Circuit breaker (esqueleto)

## Skill de lanzamiento
- **Skill:** `resilience-http` (propia) — `skills/resilience-http/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `circuitBreaker.ts` (sin trip)
- **Precondición:** `00_contexto_base.md` + código de 01–06. Existe `supabase/functions/_shared/circuitBreaker.ts`.

## Tarea
Completá **solo** `supabase/functions/_shared/circuitBreaker.ts`.

ADR-003 está **aceptado y diferido**. Este paso deja el grafo CB → HttpClient; **no** implementa umbrales, half-open ni corte de tráfico.

`CircuitBreakerImpl`:

- Guarda `proveedorId` y `CircuitBreakerOpciones`
- `isOpen()` retorna **siempre `false`**
- `recordSuccess()` y `recordFailure()` son no-ops
- Comentario `// TODO ADR-003: trip diferido` en cada método

`circuitBreakerRegistry` y `getOrCreateCB(proveedorId)`: un `Map` por worker; opciones por defecto `{ umbralFallas: 5, ventanaMs: 10_000, tiempoRecuperacionMs: 30_000 }` (documentan el futuro, no se usan).

No llames a HTTP. No uses `Deno.openKv`.

## Output esperado
Registry + clase que cumple `ICircuitBreaker` sin cortar llamadas.

## Criterio de aceptación
```bash
deno check supabase/functions/_shared/circuitBreaker.ts
```
No hay comparación contra `umbralFallas`. `isOpen()` no puede retornar `true`.
