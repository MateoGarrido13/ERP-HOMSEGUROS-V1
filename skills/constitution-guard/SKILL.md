---
name: constitution-guard
description: "Trigger: constitution-guard, AGENTS.md, stack. Reject work that contradicts the adopted stack and ADRs."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use before a spec, plan, or implementation claims a stack, architecture, or data boundary. This skill checks. It does not rewrite the constitution.

## Hard Rules

- `AGENTS.md` and `docs/ADRs/ADR-002.md`, `ADR-003.md`, and `ADR-004.md` are the adopted record.
- Stack is PostgreSQL and Auth via Supabase, the insurer hub in Edge Functions (TypeScript/Deno), and Next.js in `front/`.
- Go is allowed only after a measured Aggregator bottleneck. Circuit breaker trip stays deferred with ADR-003.
- Do not treat `prototype/` as the implementation stack.
- Do not present `sql/schema/schema.sql` and `prototype/src/db/schema.sql` as one model.
- Do not edit `AGENTS.md` or existing ADRs in this skill.

## Decision Gates

| Proposal | Action |
| --- | --- |
| Matches ADR-002, ADR-003, ADR-004 and `AGENTS.md` | Pass |
| Cites a draft or «Arquitectura (v1)» as current | Fail and name the file |
| New decision with no ADR | Stop and hand off to `adr-logger` |

## Execution Steps

1. Read `AGENTS.md` and the three adopted ADRs.
2. Compare the proposed text or diff to those sources.
3. Return pass or fail per claim. Do not fix the proposal unless the user asks.

## Output Contract

Return each claim, the source path that decides it, and `pass` or `fail`. No constitution rewrite.

## References

- `../../AGENTS.md`
- `../../docs/ADRs/ADR-002.md`
- `../../docs/ADRs/ADR-003.md`
- `../../docs/ADRs/ADR-004.md`
