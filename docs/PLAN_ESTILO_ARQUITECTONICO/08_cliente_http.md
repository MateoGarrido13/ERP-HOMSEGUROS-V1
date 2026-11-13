# PROMPT 08 — Cliente HTTP

## Skill de lanzamiento
- **Skill:** `resilience-http` (propia) — `skills/resilience-http/SKILL.md` (repite el paso 07)
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `httpClient.ts` (fetch + signal + CB)
- **Precondición:** `00_contexto_base.md` + código de 01–07. Existe `supabase/functions/_shared/httpClient.ts`.

## Tarea
Completá **solo** `supabase/functions/_shared/httpClient.ts`.

`HttpClient.post<T>(path, body, signal)`:

1. Si `circuitBreaker.isOpen()` es true, lanzá `AppError` `code: "CIRCUITO_ABIERTO"` **sin** `fetch` (fail-fast; en v1 `isOpen` es siempre false)
2. `fetch(`${baseUrl}${path}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" }, signal })`
3. Si `fetch` ok y JSON parseable: `recordSuccess()` y retorná el body como `T`
4. Si `fetch` lanza, abort, o status ≥ 400: `recordFailure()` y lanzá `AppError` (`code: "HTTP_PROVEEDOR"` o `"ABORTED"`)

El timeout de 4 s vive en el orquestador (`AbortSignal`). Este cliente **no** crea otro timer. El CB se inyecta en el constructor; el cliente no instancia el registry.

## Output esperado
POST JSON que respeta `AbortSignal` y notifica al CB.

## Criterio de aceptación
```bash
deno check supabase/functions/_shared/httpClient.ts
```
Usa `fetch` nativo. No contiene `setTimeout` ni `AbortController`. Llama a `isOpen` antes de `fetch`.
