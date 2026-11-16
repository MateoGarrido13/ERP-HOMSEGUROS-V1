---
name: adr-logger
description: "Trigger: adr-logger, nuevo ADR, MADR. Record a new decision in docs/ADRs using MADR."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when the user accepts a new architecture decision that is not already in `docs/ADRs/`. One new ADR per decision.

## Hard Rules

- Write only under `docs/ADRs/`. Never under `docs/adr/`.
- Use MADR: status, context, decision drivers, options, decision, consequences.
- Do not rewrite ADR-002, ADR-003, or ADR-004. Do not mark a draft or «Arquitectura (v1)» as accepted.
- Number the file `ADR-NNN.md` with the next free integer after the highest existing ADR.
- Do not record a decision the user has not accepted. Leave it as a question in the spec.
- Write the ADR in Spanish, matching the ADRs already in `docs/ADRs/`.

## Decision Gates

| Situation | Action |
| --- | --- |
| Same decision already accepted | Cite the existing file. Do not add another |
| User has not chosen | Stop |
| Decision changes an accepted ADR | Stop and ask. Do not edit the accepted file in this skill |

## Execution Steps

1. List `docs/ADRs/ADR-*.md` and take the next number.
2. Read the latest ADR and match its heading structure.
3. Write the new file with the accepted option and the rejected options.
4. Return the path. Do not edit `AGENTS.md` unless the user asks.

## Output Contract

Return the new ADR path, number, status, and the decision in one sentence.

## References

- `../../docs/ADRs/ADR-004.md`
- `../../AGENTS.md`
