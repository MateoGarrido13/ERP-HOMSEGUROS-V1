---
name: tdd-implementer
description: "Trigger: tdd-implementer, TDD, implementar tarea. Implement one approved plan task test-first."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when one task in an approved plan is ready to implement. One task per session. Do not start the next task.

## Hard Rules

- Require plan estado `Aprobado` or `En ejecución`, and spec estado `Aprobada`.
- Observe a failing test for that task before production code. Then make that test pass.
- Touch only the files the task names. Data access in `front/` goes through `front/src/lib/`. Do not import the Supabase client outside that interface.
- Do not import `prototype/`.
- Do not invent behavior for an open `PA-n` or `SUP-n`.
- A failing check stops the task. Do not weaken the test to match the code.

## Decision Gates

| Test result | Action |
| --- | --- |
| Fails for the missing behavior | Write the minimum code that makes it pass |
| Already passes before the change | Rewrite the test so it fails for the right reason, then implement |
| Fails outside the task | Stop and report it |

## Execution Steps

1. Read the task, its `CA-n`, and the spec section it cites.
2. Add or run the test and confirm red.
3. Implement until that test is green.
4. Run the task's named check once. Hand the diff to `drift-checker`.

## Output Contract

Return the task id, test command, red result, green result, and files changed.

## References

- `../../docs/guia-spec-driven.md`
- `../../AGENTS.md`
