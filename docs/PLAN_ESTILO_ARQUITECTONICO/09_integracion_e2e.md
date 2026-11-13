# PROMPT 09 — Walking skeleton E2E

## Skill de lanzamiento
- **Skill:** `walking-skeleton-e2e` (propia) — `skills/walking-skeleton-e2e/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `stub.ts` y del cambio de 501 → 200 en el handler
- **Precondición:** `00_contexto_base.md` + código de 01–08.

## Tarea
Este paso es el seam de integración (excepción a un solo archivo nuevo).

1. Creá `supabase/functions/cotizar/acl/mappers/stub.ts`
   - `StubACL` implementa `IProveedorACL` **sin** `HttpClient` ni red
   - Si `signal.aborted`, devolvé `CotizacionCanonica` con `proveedorId: "stub"`, `prima: 0`, `error: "aborted"`
   - Si no, cotización fija: `proveedorId: "stub"`, `prima: 1000`, `moneda: "ARS"`, `cobertura` = `solicitud.coberturaDeseada`, vigencias ISO de ejemplo, sin `error`

2. En `handler.ts`, si la solicitud ya es válida, **dejá de devolver 501**. Componé `new Orquestador([new StubACL()])`, llamá `cotizarEnParalelo`, respondé `200` con JSON del array. No instancies `ServicioCotizacion` ni Supabase (persistencia diferida). No toques Sancor, CB ni `httpClient`.

`index.ts` no se modifica.

## Output esperado
`POST` con body canónico válido → `200` y al menos una `CotizacionCanonica` de `"stub"`.

## Criterio de aceptación
```bash
deno check supabase/functions/cotizar/handler.ts supabase/functions/cotizar/acl/mappers/stub.ts
```
`stub.ts` no importa `fetch` ni `httpClient`. Body válido ya no produce 501.
