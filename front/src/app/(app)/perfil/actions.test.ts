import { beforeEach, describe, expect, test, vi } from "vitest";

const m = vi.hoisted(() => ({
  verifySession: vi.fn(),
  porId: vi.fn(),
  actualizarPerfil: vi.fn(),
  registrarAuditoria: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("../../../lib/auth/dal", () => ({ verifySession: m.verifySession }));
vi.mock("../../../lib/audit", () => ({ registrarAuditoria: m.registrarAuditoria }));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidatePath }));
vi.mock("../../../lib/auth/provider.supabase", () => ({
  UsuarioRepoSupabase: class {
    porId = m.porId;
    actualizarPerfil = m.actualizarPerfil;
  },
}));

import { guardarPerfil } from "./actions";

function form(campos: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.set(k, v);
  return f;
}

const VALIDO = {
  nombre: "  Martín  ",
  telefonoPrefijo: "54",
  telefonoArea: "11",
  telefonoNumero: "4321-9088",
};

beforeEach(() => {
  vi.resetAllMocks();
  m.verifySession.mockResolvedValue({ usuarioId: "u1", rol: "pas" });
  m.porId.mockResolvedValue({ nombrePila: "Martín", telefono: "541100000000" });
  m.actualizarPerfil.mockResolvedValue(undefined);
  m.registrarAuditoria.mockResolvedValue(undefined);
});

describe("guardarPerfil", () => {
  test("válido: guarda nombre recortado y teléfono solo dígitos, audita y revalida", async () => {
    const r = await guardarPerfil({}, form(VALIDO));
    expect(r).toEqual({ ok: true });
    expect(m.actualizarPerfil).toHaveBeenCalledWith("u1", {
      nombre: "Martín",
      telefono: "541143219088",
    });
    expect(m.registrarAuditoria).toHaveBeenCalledWith("u1", "pas", "perfil");
    expect(m.revalidatePath).toHaveBeenCalledWith("/perfil");
  });

  test("nombre vacío: error de campo, no guarda ni audita", async () => {
    const r = await guardarPerfil({}, form({ ...VALIDO, nombre: "   " }));
    expect(r.nameError).toBe("Completá el nombre.");
    expect(r.ok).toBeUndefined();
    expect(m.actualizarPerfil).not.toHaveBeenCalled();
    expect(m.registrarAuditoria).not.toHaveBeenCalled();
  });

  test("teléfono sin 10 dígitos: error de campo, no guarda ni audita", async () => {
    const r = await guardarPerfil({}, form({ ...VALIDO, telefonoNumero: "4321" }));
    expect(r.phoneError).toBe("El teléfono tiene que tener 10 dígitos.");
    expect(m.actualizarPerfil).not.toHaveBeenCalled();
    expect(m.registrarAuditoria).not.toHaveBeenCalled();
  });

  test("ignora usuarioId, rol, matricula y organizacion del formulario", async () => {
    await guardarPerfil(
      {},
      form({ ...VALIDO, usuarioId: "ajeno", rol: "directivo", matricula: "1", organizacion: "X" }),
    );
    expect(m.actualizarPerfil).toHaveBeenCalledTimes(1);
    expect(m.actualizarPerfil.mock.calls[0][0]).toBe("u1");
    expect(m.actualizarPerfil.mock.calls[0][1]).toEqual({ nombre: "Martín", telefono: "541143219088" });
    expect(m.registrarAuditoria).toHaveBeenCalledWith("u1", "pas", "perfil");
  });

  test("falla de escritura: mensaje general, sin auditoría", async () => {
    m.actualizarPerfil.mockRejectedValue(new Error("boom"));
    const r = await guardarPerfil({}, form(VALIDO));
    expect(r.formError).toBe("No pudimos guardar los cambios. Probá de nuevo.");
    expect(m.registrarAuditoria).not.toHaveBeenCalled();
  });

  test("falla de auditoría: no se completa; restaura los valores anteriores", async () => {
    m.registrarAuditoria.mockRejectedValue(new Error("audit"));
    const r = await guardarPerfil({}, form(VALIDO));
    expect(r.formError).toBe("No pudimos guardar los cambios. Probá de nuevo.");
    expect(m.actualizarPerfil).toHaveBeenLastCalledWith("u1", {
      nombre: "Martín",
      telefono: "541100000000",
    });
    expect(m.revalidatePath).not.toHaveBeenCalled();
  });

  test("falla de auditoría y de la reversión: avisa que los datos quedaron guardados", async () => {
    m.registrarAuditoria.mockRejectedValue(new Error("audit"));
    m.actualizarPerfil
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("revert"));
    const r = await guardarPerfil({}, form(VALIDO));
    expect(r.ok).toBeUndefined();
    expect(r.formError).toContain("Se guardaron los cambios");
    expect(r.formError).not.toBe("No pudimos guardar los cambios. Probá de nuevo.");
    expect(m.revalidatePath).toHaveBeenCalledWith("/perfil");
  });

  test("guardar sin cambios también audita (SUP-3)", async () => {
    m.porId.mockResolvedValue({ nombrePila: "Martín", telefono: "541143219088" });
    const r = await guardarPerfil({}, form(VALIDO));
    expect(r.ok).toBe(true);
    expect(m.registrarAuditoria).toHaveBeenCalledTimes(1);
  });
});
