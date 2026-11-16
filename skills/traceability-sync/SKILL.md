---
name: traceability-sync
description: "Trigger: traceability-sync, matriz CU spec test. Update the CU to spec to test matrix for touched cases."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use after a task is implemented and `drift-checker` returns pass. Update only the traceability rows for CU ids the change touched.

## Hard Rules

- A row needs the CU path, the spec path, and the test that asserts the cited `CA-n`.
- If no test covers the `CA-n`, write `missing`. Do not mark it covered.
- Do not add rows for CU ids outside the change.
- Do not recreate absent CU files. CU-05f stays absent unless the user asks to restore it.
- Do not edit the CU body or the spec body in this skill.
- Keep the matrix next to the spec it traces, or in the file the user names. Do not invent a second matrix.

## Decision Gates

| Evidence | Matrix cell |
| --- | --- |
| CU file, spec `CA-n`, and a test that asserts it | Linked |
| Spec exists, test does not | `missing` test |
| CU id announced, file absent | `ausente` and no spec row |

## Execution Steps

1. Read the diff and list touched CU ids.
2. Open each cited spec and the test files named by `tdd-implementer` or the plan.
3. Update only those matrix rows.
4. Report rows left `missing`.

## Output Contract

Return each touched CU id, spec path, test path or `missing`, and the matrix file edited.

## References

- `../../docs/specs/INDEX.md`
- `../../docs/guia-spec-driven.md`
- `../../docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`
