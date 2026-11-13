# PROMPT 10 — Tests de contrato ACL

## Skill de lanzamiento
- **Skill:** `deno-contract-tests` (propia) — `skills/deno-contract-tests/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `prov_mercantil_andina_test.ts`, `prov_sancor_seguros_test.ts`, `prov_zurich_test.ts` y `prov_allianz_test.ts` y del resultado de `deno test`
- **Precondición:** `00_contexto_base.md` + código de 01–09, en particular los mappers del paso 06.

## Tarea
Creá **solo** los cuatro archivos de test de contrato, uno por proveedor. Usá `Deno.test` y asserts de `https://deno.land/std@0.168.0/testing/asserts.ts`. No uses `go-testing` ni Postman.

Fixture canónico mínimo (un `SolicitudCotizacion` válido con `ramo: "automotor"`) y fixture wire del supuesto del paso 06.

Casos por cada proveedor:

### Para `prov_mercantil_andina_test.ts` (API real):

1. `toProveedorRequest` mapea correctamente un `SolicitudCotizacion` al body wire de Mercantil (localidad, vehiculo.infoauto, comision, bonificacion, productor, etc.)
2. Dado un JSON wire de respuesta con `resultado[]` de múltiples planes, `cotizar` devuelve un `CotizacionCanonica[]` con un elemento por plan, cada uno con `proveedorId: "prov_mercantil_andina"`, `estimado: false`, `prima` = `desglose.total.prema`, `cobertura` = `texto`
3. Si `HttpClient.post` lanza en cualquier paso del flujo, `cotizar` devuelve un array con un solo `CotizacionCanonica` con `error` definido, `prima: 0`, `estimado: true`

### Para `prov_sancor_seguros_test.ts` (mockeado):

1. `cotizar` devuelve un array con un solo elemento: `proveedorId: "prov_sancor_seguros"`, `prima: 0`, `cobertura: "No disponible"`, `error: "No disponible"`, `estimado: true`
2. Si `signal.aborted` es true, `cotizar` devuelve el mismo array con `error: "aborted"`
3. `cotizar` nunca llama a `HttpClient.post` (mockeado, sin red)

### Para `prov_zurich_test.ts` (mockeado):

1. `cotizar` devuelve un array con un solo elemento: `proveedorId: "prov_zurich"`, `prima: 0`, `cobertura: "No disponible"`, `error: "No disponible"`, `estimado: true`
2. Si `signal.aborted` es true, `cotizar` devuelve el mismo array con `error: "aborted"`
3. `cotizar` nunca llama a `HttpClient.post` (mockeado, sin red)

### Para `prov_allianz_test.ts` (mockeado):

1. `cotizar` devuelve un array con un solo elemento: `proveedorId: "prov_allianz"`, `prima: 0`, `cobertura: "No disponible"`, `error: "No disponible"`, `estimado: true`
2. Si `signal.aborted` es true, `cotizar` devuelve el mismo array con `error: "aborted"`
3. `cotizar` nunca llama a `HttpClient.post` (mockeado, sin red)

El `HttpClient` del test es un fake en el propio archivo de test (objeto que cumple `post`).

## Output esperado
`prov_mercantil_andina_test.ts`, `prov_sancor_seguros_test.ts`, `prov_zurich_test.ts` y `prov_allianz_test.ts`. Tres tests de contrato por archivo, sin red.

## Criterio de aceptación
```bash
deno test supabase/functions/cotizar/acl/mappers/prov_mercantil_andina_test.ts supabase/functions/cotizar/acl/mappers/prov_sancor_seguros_test.ts supabase/functions/cotizar/acl/mappers/prov_zurich_test.ts supabase/functions/cotizar/acl/mappers/prov_allianz_test.ts
```
Doce casos pasan (tres por proveedor). Los tests no hacen `fetch` real.
