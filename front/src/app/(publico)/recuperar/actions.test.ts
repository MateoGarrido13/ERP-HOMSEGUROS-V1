import { beforeEach, describe, expect, test, vi } from "vitest";

const m = vi.hoisted(() => ({
  registrarAuditoriaSinFallar: vi.fn(),
  checkResetToken: vi.fn(),
  resetPassword: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("../../../lib/audit", () => ({ registrarAuditoriaSinFallar: m.registrarAuditoriaSinFallar }));
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

    expect(m.registrarAuditoriaSinFallar).toHaveBeenCalledTimes(1);
    expect(m.registrarAuditoriaSinFallar).toHaveBeenCalledWith("u1", "pas", "cambio-contrasena");
  });

  test("si la auditoría no se pudo escribir igual termina en éxito (el helper ya dejó el registro)", async () => {
    m.registrarAuditoriaSinFallar.mockResolvedValue(false);
    m.resetPassword.mockImplementation(async (_t, _p, alCambiar) => {
      await alCambiar({ usuarioId: "u1", rol: "pas" });
      return { ok: true, usuarioId: "u1", rol: "pas" };
    });

    await expect(restablecer({}, formulario())).rejects.toThrow("REDIRECT:/?aviso=contrasena-actualizada");
  });

  test("si no se cambió la contraseña no se audita", async () => {
    m.resetPassword.mockResolvedValue({ ok: false, motivo: "enlace-invalido" });

    expect(await restablecer({}, formulario())).toEqual({ enlaceInvalido: true });
    expect(m.registrarAuditoriaSinFallar).not.toHaveBeenCalled();
  });
});
