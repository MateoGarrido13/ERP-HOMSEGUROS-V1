import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("../supabase/server", () => ({
  createClient: async () => ({ from: mocks.from }),
}));

import { UsuarioRepoSupabase } from "./provider.supabase";

const FILA = {
  id: "u1",
  email: "martin.gomez@hom.com.ar",
  nombre: "Martín",
  apellido: "Gómez",
  telefono: "541143219088",
  rol: "pas",
  organizacion: "HOM",
  estado: "activo",
};

// Cadena mínima de supabase-js: cada paso devuelve el mismo objeto y el
// último (single / maybeSingle / select) resuelve con `resultado`.
function cadena(resultado: unknown) {
  const c: Record<string, unknown> = {};
  for (const m of ["select", "eq", "update"]) c[m] = vi.fn(() => c);
  c.single = vi.fn(async () => resultado);
  c.maybeSingle = vi.fn(async () => resultado);
  c.then = (res: (v: unknown) => unknown) => Promise.resolve(resultado).then(res);
  return c as Record<string, ReturnType<typeof vi.fn>> & { then: unknown };
}

beforeEach(() => mocks.from.mockReset());

describe("UsuarioRepoSupabase.porId", () => {
  test("devuelve nombre de pila, apellido y la matrícula propia", async () => {
    mocks.from.mockImplementation((tabla: string) =>
      tabla === "usuario"
        ? cadena({ data: FILA, error: null })
        : cadena({ data: { matricula_ssn: "42108" }, error: null }),
    );
    const u = await new UsuarioRepoSupabase().porId("u1");
    expect(u).toMatchObject({
      nombre: "Martín Gómez",
      nombrePila: "Martín",
      apellido: "Gómez",
      matricula: "42108",
      telefono: "541143219088",
    });
  });

  test("sin fila de productor (directivo/administrativo) la matrícula es null", async () => {
    mocks.from.mockImplementation((tabla: string) =>
      tabla === "usuario"
        ? cadena({ data: { ...FILA, rol: "directivo" }, error: null })
        : cadena({ data: null, error: null }),
    );
    expect((await new UsuarioRepoSupabase().porId("u1"))?.matricula).toBeNull();
  });

  test("usuario inexistente o error devuelve null", async () => {
    mocks.from.mockReturnValue(cadena({ data: null, error: { message: "x" } }));
    expect(await new UsuarioRepoSupabase().porId("u1")).toBeNull();
  });
});

describe("UsuarioRepoSupabase.actualizarPerfil", () => {
  test("actualiza solo nombre y telefono de la fila indicada", async () => {
    const c = cadena({ data: [{ id: "u1" }], error: null });
    mocks.from.mockReturnValue(c);
    await new UsuarioRepoSupabase().actualizarPerfil("u1", { nombre: "Martín", telefono: "541143219088" });
    expect(mocks.from).toHaveBeenCalledWith("usuario");
    expect(c.update).toHaveBeenCalledWith({ nombre: "Martín", telefono: "541143219088" });
    expect(c.eq).toHaveBeenCalledWith("id", "u1");
  });

  test("si no afecta ninguna fila (RLS) lanza error", async () => {
    mocks.from.mockReturnValue(cadena({ data: [], error: null }));
    await expect(
      new UsuarioRepoSupabase().actualizarPerfil("u1", { nombre: "a", telefono: "1" }),
    ).rejects.toThrow(/ninguna fila/);
  });

  test("si la base devuelve error lanza error", async () => {
    mocks.from.mockReturnValue(cadena({ data: null, error: { message: "boom" } }));
    await expect(
      new UsuarioRepoSupabase().actualizarPerfil("u1", { nombre: "a", telefono: "1" }),
    ).rejects.toThrow(/boom/);
  });
});
