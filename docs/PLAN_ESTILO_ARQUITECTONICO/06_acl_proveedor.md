# PROMPT 06 — ACL Sancor

## Skill de lanzamiento
- **Skill:** `provider-acl` (propia) — `skills/provider-acl/SKILL.md`
- **Estado:** existente
- **Granularidad:** 1 agente, 1 skill. No apilar otras.
- **Engram al abrir:** `mem_current_project` → `mem_context` → `mem_search` (`topic_key`: `architecture/supabase-edge-hub`)
- **Engram al cerrar:** `mem_save` de `sancor.ts` (mapeo canónico ↔ wire)
- **Precondición:** `00_contexto_base.md` + código de 01–05. Existe `supabase/functions/cotizar/acl/mappers/sancor.ts`.

## Tarea
Completá **solo** `supabase/functions/cotizar/acl/mappers/sancor.ts`. No toques `zurich.ts`. No extraigas helpers compartidos entre ACLs.

`SancorACL` implementa `IProveedorACL`:

- Constructor: `httpClient: HttpClient`
- `cotizar`: `toProveedorRequest` → `httpClient.post` a `"/cotizar"` → `toCanonical`. Si el `signal` está abortado o `post` lanza, devolvé `CotizacionCanonica` con `proveedorId: "sancor"` y `error` (no relances al orquestador si podés degradar)
- `toProveedorRequest` y `toCanonical` **privados**

**Supuesto de contrato wire (no es la API real de Sancor):**

```typescript
// request
{ brand: string; model: string; year: number; plate: string; dni: string; birthDate: string; cover: string }
// response
{ company: "sancor"; premium: number; currency: "ARS" | "USD"; coverLabel: string; from: string; to: string; detailUrl?: string }
```

`cover` mapea `terceros` → `"third_party"`, `terceros_completo` → `"third_party_full"`, `todo_riesgo` → `"all_risk"`. Inverso en `toCanonical`. `prima` = `premium`.

## Output esperado
Un mapper aislado. Cero imports desde `zurich.ts` u otros mappers.

## Criterio de aceptación
```bash
deno check supabase/functions/cotizar/acl/mappers/sancor.ts
```
No hay imports relativos a otros archivos bajo `acl/mappers/`. `toProveedorRequest` y `toCanonical` no son exportados.
