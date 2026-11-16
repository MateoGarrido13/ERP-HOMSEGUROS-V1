---
name: ui-spec-author
description: "Trigger: ui-spec, pantalla, UI spec. Draft the UI module only for walking-skeleton screens."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when a draft spec needs its screen module for a walking-skeleton screen. Do not specify screens outside that skeleton unless the user names them.

## Hard Rules

- Edit only the UI module of an existing `spec.md` that `spec-author` already created. Keep estado `Borrador`.
- Every label, state, and action must come from the cited CU or from an explicit user decision.
- Do not add fields. CU-17b field lists stay in `SUP-n` until the CU or the user names them.
- Cover empty, error, and loading states named by the CU. Do not invent extra states.
- Prototype screens are a visual reference. Deviations stay recorded; they do not become the spec.

## Decision Gates

| Screen | Action |
| --- | --- |
| On the path CU-08d → CU-09 → CU-10 → CU-17 or CU-17b → CU-18 → CU-13 → CU-14 → CU-16 → CU-22, CU-25, or CU-27 | Specify it |
| Any other screen | Stop and ask |
| CU-05f or another absent CU | Do not specify a screen for it |

## Execution Steps

1. Read the CU for that screen and the current `spec.md`.
2. Fill only the UI module from `docs/templates/template-spec.md`.
3. Name each state and the CU step that requires it.
4. Leave non-UI modules unchanged.

## Output Contract

Return the spec path, screens specified, CU ids, and any screen refused as out of the skeleton.

## References

- `../../docs/templates/template-spec.md`
- `../../docs/specs/INDEX.md`
- `../../docs/casos-de-uso/PAS/pendientes/CU-05-Pendientes_Ver_Pendientes.md`
