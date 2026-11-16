---
name: drift-checker
description: "Trigger: drift-checker, drift, spec vs código. Compare a change to the approved spec before commit or PR."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use before a commit or pull request that claims to finish a planned task. Read-only: report drift, do not fix it unless the user asks.

## Hard Rules

- Compare the diff to the approved spec and the task. The spec wins until a human updates it.
- Behavior in the diff that the spec does not name is drift.
- A spec rule with no test and no code is drift.
- Do not treat a green test as approval when the assertion is weaker than the `CA-n`.
- Do not update the spec or the code in this skill.
- Do not commit.

## Decision Gates

| Diff vs spec | Action |
| --- | --- |
| Same behavior as the cited `CA-n` | Pass |
| Extra behavior or a missing `CA-n` | Fail |
| Spec was edited in the same change as its implementation | Fail. Spec lands before code |

## Execution Steps

1. Read the approved `spec.md`, the task, and the current diff.
2. Map each hunk to a `CA-n` or mark it unmapped.
3. Return pass or fail. Do not stage files.

## Output Contract

Return `pass` or `fail`, each unmapped hunk, and each `CA-n` with no corresponding change.

## References

- `../../docs/guia-spec-driven.md`
