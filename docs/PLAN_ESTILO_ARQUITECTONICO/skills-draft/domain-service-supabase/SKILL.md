---
name: domain-service-supabase
description: "Trigger: servicio de dominio, ServicioCotizacion, SupabaseClient, persistencia stub. Implement the cotizar domain service without talking to insurers."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when implementing `supabase/functions/cotizar/servicio.ts` or when a prompt names this skill. One agent, this skill only.

## Hard Rules

- Edit only `servicio.ts`.
- Depend on `Orquestador` and `SupabaseClient`. Do not import `acl/mappers`.
- `cotizar` delegates to `orquestador.cotizarEnParalelo`. Do not call `this.supabase` in `cotizar`.
- Persistence stays a private `// TODO` method. Do not INSERT.
- No JWT, no provider IDs, no HTTP.

## Decision Gates

| Urge | Action |
| --- | --- |
| Map Sancor/Zurich JSON | Refuse; that is an ACL |
| Write quotes to Postgres | Leave TODO; do not execute |
| Fan-out / timeout | Refuse; that is the orchestrator |

## Execution Steps

1. Read prompt `04_servicio_dominio.md`.
2. Fill `ServicioCotizacion` as specified.
3. `deno check supabase/functions/cotizar/servicio.ts`.
4. `mem_save` constructor deps and the persistencia TODO.

## Output Contract

Return: path edited, public methods, confirmation of no mapper imports.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/04_servicio_dominio.md`
- `docs/ADRs/ADR-004.md`
