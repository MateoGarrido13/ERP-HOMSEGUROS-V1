---
name: provider-acl
description: "Trigger: ACL, mapper, SancorACL, ZurichACL, toCanonical, toProveedorRequest, capa anticorrupción. Translate one insurer wire format to canonical types."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when implementing one file under `supabase/functions/cotizar/acl/mappers/` or when a prompt names this skill. One agent, this skill, one provider per session.

## Hard Rules

- Edit only the mapper named by the prompt.
- Do not share code with another provider ACL. No common mapper helper.
- Implement `IProveedorACL`. Keep `toProveedorRequest` and `toCanonical` private.
- Canonical types stay in `_shared/types.ts`. Wire shapes stay in this file.
- Do not instantiate the circuit breaker. Receive `HttpClient`.

## Decision Gates

| Situation | Action |
| --- | --- |
| Second provider | New file, copy nothing from the first ACL |
| Unknown real insurer API | Use the wire contrato documented as supuesto in the prompt |
| Mapping failure | Return canonical with `error`; do not throw past the ACL if the prompt allows degrade |

## Execution Steps

1. Read the named prompt (usually `06_acl_proveedor.md`) and `IProveedorACL`.
2. Implement that mapper only.
3. `deno check` the file.
4. `mem_save` proveedorId and wire supuesto.

## Output Contract

Return: path edited, proveedorId, confirmation of no sibling-mapper imports.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/06_acl_proveedor.md`
- `docs/ADRs/ADR-002.md`
