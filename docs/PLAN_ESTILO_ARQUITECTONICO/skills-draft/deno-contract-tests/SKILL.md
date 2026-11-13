---
name: deno-contract-tests
description: "Trigger: Deno.test, tests de contrato, sancor_test, ACL fixture. Write Deno contract tests between an ACL and its wire supuesto."
license: Apache-2.0
metadata:
  author: hom-erp
  version: "1.0"
---

## Activation Contract

Use when adding `Deno.test` contract tests for an ACL (prompt 10). One agent, this skill only.

## Hard Rules

- Create only the test file named by the prompt (default `sancor_test.ts`).
- Use `Deno.test` and `deno.land/std` asserts. Do not use `go-testing` or Postman.
- Fake `HttpClient.post` in the test file. No real `fetch`.
- Do not make ACL private mappers public. Drive behavior through `cotizar`.
- Do not change production mapper files unless a test cannot compile; if blocked, stop and report.

## Decision Gates

| Case | Assert |
| --- | --- |
| Wire success | Canonical `proveedorId`, `prima` = premium, mapped cover |
| `post` throws | Canonical with `error`, `prima: 0` |
| Need live HTTP | Refuse |

## Execution Steps

1. Read `06_acl_proveedor.md` (wire supuesto) and `10_tests_contrato.md`.
2. Write three tests with in-memory `HttpClient`.
3. Run `deno test` on that file.
4. `mem_save` pass/fail.

## Output Contract

Return: test path, command, observed result. No production ACL edits.

## References

- `docs/PLAN_ESTILO_ARQUITECTONICO/10_tests_contrato.md`
- `docs/PLAN_ESTILO_ARQUITECTONICO/06_acl_proveedor.md`
