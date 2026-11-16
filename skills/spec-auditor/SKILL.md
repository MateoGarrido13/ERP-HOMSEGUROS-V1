---
name: spec-auditor
description: "Trigger: spec-auditor, auditar spec, revisar spec. Check a draft spec against its use case."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when a `spec.md` needs a check before a human approves it. Read-only: do not edit the spec and do not approve it.

## Hard Rules

- The use case wins over the spec. A rule that is not in the CU, the code, or an explicit user decision is a defect.
- Do not change estado to `Aprobada`. Approval is human.
- Check that every scenario cites a CU id and that every CU alternate flow in scope has a scenario or an explicit exclusion.
- `SUP-n` and `PA-n` block approval until a human resolves them.
- Do not treat `prototype/` behavior as a requirement.

## Decision Gates

| Defect | Severity |
| --- | --- |
| Invented business rule, or CU flow missing with no exclusion | Blocker |
| Template section renamed, reordered, or silently dropped | Blocker |
| Wording drift that keeps the same rule | Note |
| Open `SUP-n` or `PA-n` | Blocker for approval |

## Execution Steps

1. Read the spec and each cited file under `docs/casos-de-uso/`.
2. Compare flows, rules, and out-of-scope lines with the CU.
3. Check ids `CA-n`, `RN-n`, `SUP-n`, and `PA-n` are unique inside the file.
4. Return blockers and notes. Do not rewrite the spec.

## Output Contract

Return `pass` or `fail`, then each finding with spec location, CU location, and severity.

## References

- `../../docs/guia-spec-driven.md`
- `../../docs/templates/template-spec.md`
