import { describe, expect, test } from "vitest";

import { motivoSeguro } from "./errores";

describe("motivoSeguro", () => {
  test("reemplaza URLs (con query y token) por [url]", () => {
    expect(motivoSeguro(new Error("fetch failed: https://x.test/auth/v1/verify?token_hash=SECRETO&type=recovery"))).toBe(
      "fetch failed: [url]",
    );
  });

  test("acota el largo", () => {
    expect(motivoSeguro(new Error("a".repeat(500)))).toHaveLength(200);
  });

  test("tolera valores que no son Error", () => {
    expect(motivoSeguro("falló")).toBe("falló");
    expect(motivoSeguro(undefined)).toBe("error desconocido");
  });
});
