# PROMPT 10 — Tests de contrato ACL

## Skill de lanzamiento
- **Skill:** `deno-contract-tests` (propia) — `skills/deno-contract-tests/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `sancor_test.ts` y del resultado de `deno test`
- **Precondición:** `00_contexto_base.md` + código de 01–09, en particular `sancor.ts` del paso 06.

## Tarea
Creá **solo** `supabase/functions/cotizar/acl/mappers/sancor_test.ts`.

Usá `Deno.test` y asserts de `https://deno.land/std@0.168.0/testing/asserts.ts`. No uses `go-testing` ni Postman.

Fixture canónico mínimo (un `SolicitudCotizacion` válido) y fixture wire del supuesto del paso 06.

Casos:

1. `toProveedorRequest` (accedé vía una instancia y el resultado de `cotizar` mockeando `HttpClient.post`, o exportá de prueba solo si hace falta un helper de test en **este** archivo — no cambies `sancor.ts` para hacer públicos los privados)
2. Dado el JSON wire de respuesta del paso 06, `cotizar` devuelve `proveedorId: "sancor"`, `prima` = `premium`, cobertura canónica
3. Si `HttpClient.post` lanza, `cotizar` devuelve `CotizacionCanonica` con `error` definido y `prima: 0`

El `HttpClient` del test es un fake en el propio archivo de test (objeto que cumple `post`).

## Output esperado
Tres tests de contrato, sin red.

## Criterio de aceptación
```bash
deno test supabase/functions/cotizar/acl/mappers/sancor_test.ts
```
Los tres casos pasan. El test no hace `fetch` real.
