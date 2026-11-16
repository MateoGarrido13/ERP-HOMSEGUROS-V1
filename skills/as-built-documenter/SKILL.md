---
name: as-built-documenter
description: "Trigger: as-built, prototipo, rutas UX. Record prototype routes as read-only UX notes."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when documenting what `prototype/` already shows for pendientes, multicotizador, or cartera. Read-only on the prototype.

## Hard Rules

- `prototype/` is a UX reference. Do not import it from `front/` and do not treat it as the implementation stack.
- Record route deviations from the use case. Do not change the use case to match the prototype.
- Do not edit files under `prototype/`.
- Do not merge `sql/schema/schema.sql` with `prototype/src/db/schema.sql`.
- Unknown screens stay as open questions. Do not invent routes.

## Decision Gates

| Prototype vs CU | Action |
| --- | --- |
| Same step, different order or label | Note the deviation and cite the CU id |
| Screen exists only in the prototype | Mark it as prototype-only |
| CU step has no prototype route | Mark it as missing in the prototype |

## Execution Steps

1. Read the slice use cases under `docs/casos-de-uso/PAS/`.
2. Read the matching routes in `prototype/` only.
3. Write or update `docs/specs/as-built-prototipo-iteracion-1.md` with route, CU id, and deviation.
4. Leave `status` as `draft` unless the user sets another status.

## Output Contract

Return each noted route, its CU id, and whether it matches, deviates, or is missing. Name the file written.

## References

- `../../docs/specs/as-built-prototipo-iteracion-1.md`
- `../../AGENTS.md`
