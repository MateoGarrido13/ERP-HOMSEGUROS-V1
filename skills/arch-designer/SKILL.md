---
name: arch-designer
description: "Trigger: arch-designer, plan técnico, contratos del hub. Draft hub ports and schema boundaries for one approved spec."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when an approved spec needs its technical plan: hub ports, domain types, and which schema the feature reads. Do not implement the hub.

## Hard Rules

- Require spec estado `Aprobada` before drafting the plan. Otherwise stop.
- Follow ADR-002, ADR-003, and ADR-004. Do not copy «Arquitectura (v1)» into an ADR.
- Declare which schema the feature uses. Do not merge `sql/schema/schema.sql` with `prototype/src/db/schema.sql`.
- Hub ports in this iteration are quote, partial aggregate, and per-carrier failure or timeout. Idempotency and correlation id belong in the technical plan.
- A new decision is written only by `adr-logger` under `docs/ADRs/`. Do not create an ADR here.
- `front/` reads data only through `front/src/lib/`.

## Decision Gates

| Need | Action |
| --- | --- |
| Decision already in an ADR | Cite that ADR. Do not write a new one |
| Decision absent from ADRs and the spec | Stop and list it as a question |
| Carrier-specific JSON | Leave it to the provider ACL. Do not put it in the canonical types |

## Execution Steps

1. Read the approved spec, `AGENTS.md`, and ADR-002, ADR-003, and ADR-004.
2. Draft the technical plan in the spec folder using `docs/templates/template-plan.md` only for sequencing that is already designed. Design gaps go back to the spec.
3. Name each port, timeout, and schema file.
4. Hand new decisions to `adr-logger`. Do not open `docs/adr/`.

## Output Contract

Return the plan path, ports named, schema file cited, and any decision deferred to `adr-logger`.

## References

- `../../docs/ADRs/ADR-002.md`
- `../../docs/ADRs/ADR-004.md`
- `../../docs/templates/template-plan.md`
- `../../AGENTS.md`
