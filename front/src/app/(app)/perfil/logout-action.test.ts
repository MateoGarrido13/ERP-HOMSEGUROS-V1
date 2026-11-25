import { beforeEach, describe, expect, test, vi } from "vitest";

const m = vi.hoisted(() => ({
  getSessionOptional: vi.fn(),
  registrarAuditoria: vi.fn(),
  destroySession: vi.fn(),
  clearSession: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("../../../lib/auth/dal", () => ({ getSessionOptional: m.getSessionOptional }));
vi.mock("../../../lib/audit", () => ({ registrarAuditoria: m.registrarAuditoria }));
vi.mock("../../../lib/auth/session", () => ({ clearSession: m.clearSession }));
vi.mock("../../../lib/auth/provider.supabase", () => ({
  AuthProviderSupabase: class {
    destroySession = m.destroySession;
  },
}));
// redirect() de Next corta la ejecución lanzando; se simula igual.
vi.mock("next/navigation", () => ({ redirect: m.redirect }));

import { cerrarSesion } from "./logout-action";

async function ejecutar() {
  await expect(cerrarSesion()).rejects.toThrow("REDIRECT:/");
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.redirect.mockImplementation((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  });
  m.getSessionOptional.mockResolvedValue({ usuarioId: "u1", rol: "pas" });
  m.registrarAuditoria.mockResolvedValue(undefined);
  m.destroySession.mockResolvedValue(undefined);
  m.clearSession.mockResolvedValue(undefined);
});

describe("cerrarSesion", () => {
  test("con sesión válida audita `cierre`, destruye la sesión y redirige a /", async () => {
    await ejecutar();
    expect(m.registrarAuditoria).toHaveBeenCalledWith("u1", "pas", "cierre");
    expect(m.destroySession).toHaveBeenCalledTimes(1);
  });

  test("audita antes de destruir la sesión", async () => {
    const orden: string[] = [];
    m.registrarAuditoria.mockImplementation(async () => void orden.push("auditar"));
    m.destroySession.mockImplementation(async () => void orden.push("destruir"));
    await ejecutar();
    expect(orden).toEqual(["auditar", "destruir"]);
  });

  test("con sesión vencida o sin cookie: no audita, borra la cookie y redirige sin error", async () => {
    m.getSessionOptional.mockResolvedValue(null);
    await ejecutar();
    expect(m.registrarAuditoria).not.toHaveBeenCalled();
    expect(m.destroySession).not.toHaveBeenCalled();
    expect(m.clearSession).toHaveBeenCalledTimes(1);
  });

  test("falla del proveedor al destruir: borra igual la cookie y redirige", async () => {
    m.destroySession.mockRejectedValue(new Error("proveedor caído"));
    await ejecutar();
    expect(m.clearSession).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
  });

  test("falla de auditoría: no traba el cierre", async () => {
    m.registrarAuditoria.mockRejectedValue(new Error("audit"));
    await ejecutar();
    expect(m.destroySession).toHaveBeenCalledTimes(1);
  });

  test("falla también el borrado de cookie: igual redirige a /", async () => {
    m.getSessionOptional.mockResolvedValue(null);
    m.clearSession.mockRejectedValue(new Error("x"));
    await ejecutar();
  });

  test("idempotente: dos ejecuciones seguidas terminan igual en /", async () => {
    await ejecutar();
    m.getSessionOptional.mockResolvedValue(null);
    await ejecutar();
    expect(m.registrarAuditoria).toHaveBeenCalledTimes(1);
  });
});
