---
name: canonical-types
description: "Trigger: canonical types, contratos entre capas, types.ts, SolicitudCotizacion, IProveedorACL. Fill only the shared TypeScript contracts for the insurer hub."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when implementing or changing `supabase/functions/_shared/types.ts` or when a prompt names this skill. One agent, this skill only.

## Hard Rules

- Edit only `supabase/functions/_shared/types.ts`.
- Copy `SolicitudCotizacion` and `CotizacionCanonica` from `docs/PLAN_ESTILO_ARQUITECTONICO/00_contexto_base.md`. Do not add fields.
- Prefix interfaces with `I`. Implementations do not live in this file.
- `AppError` extends `Error` and exposes `readonly code: string`.
- No provider wire types, JWT, or database row types.

## Decision Gates

| Need | Action |
| --- | --- |
| Provider-specific JSON | Refuse; belongs in that ACL file |
| Extra canonical fields | Refuse unless `00_contexto_base.md` already has them |
| Layer contract missing from prompt 02 | Add only what prompt 02 lists |

## Execution Steps

1. Read `00_contexto_base.md` and prompt `02_tipos_contratos.md`.
2. Replace the 01 skeleton in `types.ts` with the listed exports.
3. Run `deno check supabase/functions/_shared/types.ts`.
4. `mem_save` the export list.

## Output Contract

Return: path edited, exported symbols, `deno check` result. No other files.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/00_contexto_base.md`
- `docs/PLAN_ESTILO_ARQUITECTONICO/02_tipos_contratos.md`
- `docs/ADRs/ADR-002.md`
