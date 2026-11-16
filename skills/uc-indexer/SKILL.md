---
name: uc-indexer
description: "Trigger: uc-indexer, índice CU, inventario casos de uso. Verify on-disk use cases against the existing index."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when checking or refreshing the iteration inventory of use cases. One agent, this skill only.

## Hard Rules

- Read `docs/casos-de-uso/`. Do not recreate an empty index.
- A CU is present only when its `.md` file exists. Mark a named ID with no file as absent.
- Do not restore a missing CU from git history unless the user asks.
- Do not invent flows, rules, or statuses. Copy IDs and paths from disk and the canonical list.
- Do not edit product code, `prototype/`, or ADR files.

## Decision Gates

| Finding | Action |
| --- | --- |
| File has flow and rules | Status `presente` |
| File is title-only | Status `stub` |
| Listed ID, no file | Status `ausente` |
| Second file for the same ID | Name both paths; do not merge them |

## Execution Steps

1. List `docs/casos-de-uso/**/CU-*.md`.
2. Cross-check IDs in `docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md` and `docs/specs/INDEX.md`.
3. Update only the inventory tables the user named. Leave unrelated docs unchanged.
4. Report present, stub, and absent IDs with paths.

## Output Contract

Return the CU id, path, and status for every ID checked, plus files edited. No new business rules.

## References

- `../../docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`
- `../../docs/specs/INDEX.md`
