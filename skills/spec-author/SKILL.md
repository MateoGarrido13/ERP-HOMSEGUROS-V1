---
name: spec-author
description: "Trigger: spec-author, redactar spec, specify. Draft a Spanish spec from a use case and the template."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when drafting `spec.md` for one user story or one feature that shares a technical decision. Do not implement code.

## Hard Rules

- Start from `docs/templates/template-spec.md`. Delete unused modules. Do not rename or reorder the sections you keep.
- Write the spec in Spanish. Code names stay as in the existing code.
- Cite each scenario with its CU id. Do not invent business rules. Unknown facts go under Supuestos or Preguntas abiertas.
- Set estado to `Borrador`. Do not set `Aprobada`.
- Put the file in `docs/specs/ERP-<n>-<slug>/spec.md`. Do not write the spec body into Jira.
- One spec per user story, unless several stories share the same data model, service, or endpoint.

## Decision Gates

| Input | Action |
| --- | --- |
| CU file missing | Stop and report the id. Do not draft from the index line alone |
| Fact absent from CU, code, and the user | Put it in `SUP-n` or `PA-n` |
| UI screen in the walking skeleton | Leave the UI module for `ui-spec-author` |
| Hub port or schema boundary | Leave the technical plan for `arch-designer` |

## Execution Steps

1. Read the CU, `docs/guia-spec-driven.md`, and the template.
2. Read only the code paths the user named.
3. Draft `spec.md` with `CA-n`, `RN-n`, `SUP-n`, and `PA-n` ids that are not reused.
4. Run `spec-auditor` before asking for human approval.

## Output Contract

Return the spec path, CU ids cited, and every `SUP-n` and `PA-n`. Estado remains `Borrador`.

## References

- `../../docs/templates/template-spec.md`
- `../../docs/guia-spec-driven.md`
- `../../docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`
