import { describe, expect, test } from "vitest";
import { TokenResetStore } from "./provider.dev";

describe("TokenResetStore", () => {
  test("genera un token y su estado es vigente", () => {
    const store = new TokenResetStore();
    const token = store.generarPara("martin.gomez@hom.com.ar");
    expect(store.estado(token)).toBe("vigente");
  });

  test("token desconocido es invalido", () => {
    const store = new TokenResetStore();
    expect(store.estado("token-inexistente")).toBe("invalido");
  });

  test("usar un token dos veces: segunda vez es usado", () => {
    const store = new TokenResetStore();
    const token = store.generarPara("martin.gomez@hom.com.ar");
    expect(store.estado(token)).toBe("vigente");
    expect(store.consumir(token)).toBe(true);
    expect(store.estado(token)).toBe("usado");
    expect(store.consumir(token)).toBe(false);
  });

  test("token vencido con reloj inyectable", () => {
    let ahora = 1_700_000_000_000;
    const store = new TokenResetStore(() => ahora);
    const token = store.generarPara("laura.rios@hom.com.ar");
    expect(store.estado(token)).toBe("vigente");

    // Avanzar el reloj más allá del TTL (24h = 86_400_000 ms)
    ahora += 25 * 60 * 60 * 1000;
    expect(store.estado(token)).toBe("vencido");
  });

  test("generar un nuevo token invalida el previo del mismo email (SUP-3)", () => {
    const store = new TokenResetStore();
    const t1 = store.generarPara("martin.gomez@hom.com.ar");
    const t2 = store.generarPara("martin.gomez@hom.com.ar");
    expect(store.estado(t1)).toBe("usado");
    expect(store.estado(t2)).toBe("vigente");
  });

  test("consumir devuelve email del token", () => {
    const store = new TokenResetStore();
    const token = store.generarPara("pablo.sosa@hom.com.ar");
    expect(store.emailDe(token)).toBe("pablo.sosa@hom.com.ar");
    expect(store.consumir(token)).toBe(true);
    // Tras consumir, emailDe aún funciona (solo marca usado)
    expect(store.emailDe(token)).toBe("pablo.sosa@hom.com.ar");
  });
});
