import { beforeEach, describe, expect, test, vi } from "vitest";

const registrar = vi.hoisted(() => vi.fn());
vi.mock("./repo.supabase", () => ({
  AuditoriaRepoSupabase: class {
    registrar = registrar;
  },
}));

import { registrarAuditoria, registrarAuditoriaSinFallar } from "./index";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("registrarAuditoriaSinFallar (ERP-291)", () => {
  test("éxito: registra y devuelve true sin loguear", async () => {
    registrar.mockResolvedValue(undefined);
    expect(await registrarAuditoriaSinFallar("u1", "pas", "cambio-contrasena")).toBe(true);
    expect(registrar).toHaveBeenCalledWith("u1", "pas", "cambio-contrasena");
    expect(console.error).not.toHaveBeenCalled();
  });

  test("falla: no lanza, devuelve false y deja un registro estructurado y buscable", async () => {
    registrar.mockRejectedValue(new Error("No se pudo registrar la auditoría: RLS"));

    expect(await registrarAuditoriaSinFallar("u1", "pas", "cambio-contrasena")).toBe(false);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [etiqueta, json] = vi.mocked(console.error).mock.calls[0] as [string, string];
    expect(etiqueta).toBe("[auditoria]");
    expect(JSON.parse(json)).toEqual({
      evento: "auditoria.fallo",
      accion: "cambio-contrasena",
      usuarioId: "u1",
      rol: "pas",
      motivo: "No se pudo registrar la auditoría: RLS",
    });
  });

  test("el registro no incluye datos sensibles aunque el error los traiga en otros campos", async () => {
    registrar.mockRejectedValue(Object.assign(new Error("boom"), { token: "tok-secreto", password: "Clave2026x" }));
    await registrarAuditoriaSinFallar("u1", "pas", "cambio-contrasena");
    const salida = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(salida).not.toContain("tok-secreto");
    expect(salida).not.toContain("Clave2026x");
  });
});

describe("registrarAuditoria (sin cambios)", () => {
  test("sigue propagando el error al que llama", async () => {
    registrar.mockRejectedValue(new Error("RLS"));
    await expect(registrarAuditoria("u1", "pas", "ingreso")).rejects.toThrow("RLS");
  });
});
