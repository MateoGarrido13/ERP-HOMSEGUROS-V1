---
name: task-planner
description: "Trigger: task-planner, plan de tareas, tasks. Split an approved spec into atomic plan tasks."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when an approved spec needs `plan.md`. Do not implement the tasks.

## Hard Rules

- Require spec estado `Aprobada`. If the work has about three tasks or fewer, still write the plan when the user asks; do not skip a required plan for architecture, data, or API changes.
- Start from `docs/templates/template-plan.md`. Do not redefine the design.
- One task is one behavior, with its files and its check. Do not split one behavior into separate test-only and code-only tasks.
- Set plan estado to `Borrador` until a human approves it.
- If a design decision is missing, stop and send it back to the spec. Do not hide it inside a task.
- Do not add tasks the spec does not ask for.

## Decision Gates

| Spec state | Action |
| --- | --- |
| `Aprobada` and design complete | Write `T-n` tasks |
| Open `PA-n` that the task needs | Stop |
| Design gap found while sequencing | Return to `spec-author` |

## Execution Steps

1. Read the approved `spec.md` and the plan template.
2. Order tasks by dependency. Name exact file paths.
3. Map each task to the `CA-n` it proves.
4. Leave implementation to `tdd-implementer`.

## Output Contract

Return the plan path, each `T-n` with its `CA-n`, and any task not written because the spec is incomplete.

## References

- `../../docs/templates/template-plan.md`
- `../../docs/guia-spec-driven.md`
