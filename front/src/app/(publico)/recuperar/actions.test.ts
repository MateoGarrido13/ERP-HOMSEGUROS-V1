import { beforeEach, describe, expect, test, vi } from "vitest";

const m = vi.hoisted(() => ({
  registrarAuditoria: vi.fn(),
  checkResetToken: vi.fn(),
  resetPassword: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("../../../lib/audit", () => ({ registrarAuditoria: m.registrarAuditoria }));
vi.mock("../../../lib/auth/provider.supabase", () => ({
  AuthProviderSupabase: class {
    checkResetToken = m.checkResetToken;
    resetPassword = m.resetPassword;
  },
}));
// redirect() de Next corta la ejecución lanzando; se simula igual.
vi.mock("next/navigation", () => ({ redirect: m.redirect }));

import { restablecer } from "./actions";

function formulario(password = "Nueva2026x") {
  const f = new FormData();
  f.set("token", "tok");
  f.set("password", password);
  f.set("confirm", password);
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.checkResetToken.mockResolvedValue("vigente");
  m.redirect.mockImplementation((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  });
});

describe("restablecer: auditoría de cambio-contrasena (ERP-6 CA-12)", () => {
  test("pasa a resetPassword un callback que audita al usuario y rol que cambió la contraseña", async () => {
    m.resetPassword.mockImplementation(async (_t, _p, alCambiar) => {
      await alCambiar({ usuarioId: "u1", rol: "pas" });
      return { ok: true, usuarioId: "u1", rol: "pas" };
    });

    await expect(restablecer({}, formulario())).rejects.toThrow("REDIRECT:/?aviso=contrasena-actualizada");

    expect(m.registrarAuditoria).toHaveBeenCalledTimes(1);
    expect(m.registrarAuditoria).toHaveBeenCalledWith("u1", "pas", "cambio-contrasena");
  });

  test("si la auditoría falla igual termina en éxito y deja el error en el log", async () => {
    m.registrarAuditoria.mockRejectedValue(new Error("RLS"));
    m.resetPassword.mockImplementation(async (_t, _p, alCambiar) => {
      await alCambiar({ usuarioId: "u1", rol: "pas" });
      return { ok: true, usuarioId: "u1", rol: "pas" };
    });

    await expect(restablecer({}, formulario())).rejects.toThrow("REDIRECT:/?aviso=contrasena-actualizada");
    expect(console.error).toHaveBeenCalled();
  });

  test("si no se cambió la contraseña no se audita", async () => {
    m.resetPassword.mockResolvedValue({ ok: false, motivo: "enlace-invalido" });

    expect(await restablecer({}, formulario())).toEqual({ enlaceInvalido: true });
    expect(m.registrarAuditoria).not.toHaveBeenCalled();
  });
});
