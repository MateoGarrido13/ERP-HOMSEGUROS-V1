import { beforeEach, describe, expect, test, vi } from "vitest";

const auth = {
  resetPasswordForEmail: vi.fn(),
  verifyOtp: vi.fn(),
  updateUser: vi.fn(),
  getUser: vi.fn(),
  signOut: vi.fn(),
};
const consultaUsuario = vi.fn();
const verificadorAuth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
};

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: "127.0.0.1:3002" }),
}));
vi.mock("../supabase/server", () => ({
  createClient: async () => ({
    auth,
    from: () => ({ select: () => ({ eq: () => ({ single: consultaUsuario }) }) }),
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: verificadorAuth }),
}));

import { AuthProviderSupabase } from "./provider.supabase";

const TOKEN = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8";
const proveedor = new AuthProviderSupabase();

beforeEach(() => {
  vi.resetAllMocks();
  auth.signOut.mockResolvedValue({ error: null });
  verificadorAuth.signOut.mockResolvedValue({ error: null });
});

describe("requestPasswordReset", () => {
  test("pide el correo a Supabase con el email normalizado y el redirect a /recuperar/nueva", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const r = await proveedor.requestPasswordReset("  Ana@HOM.com.ar ");
    expect(r).toEqual({ enviado: true });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("ana@hom.com.ar", {
      redirectTo: "http://127.0.0.1:3002/recuperar/nueva",
    });
  });

  test("el límite nativo de pedidos no se revela: sigue siendo enviado", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { code: "over_email_send_rate_limit", status: 429 },
    });
    expect(await proveedor.requestPasswordReset("ana@hom.com.ar")).toEqual({ enviado: true });
  });

  test("falla del servicio de correo: enviado false", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { code: "unexpected_failure", status: 500 },
    });
    expect(await proveedor.requestPasswordReset("ana@hom.com.ar")).toEqual({ enviado: false });
  });
});

describe("checkResetToken", () => {
  test("token con forma de enlace: vigente (la vigencia real se comprueba al guardar)", async () => {
    expect(await proveedor.checkResetToken(TOKEN)).toBe("vigente");
  });

  test("vacío o con basura: invalido", async () => {
    expect(await proveedor.checkResetToken("")).toBe("invalido");
    expect(await proveedor.checkResetToken("corto")).toBe("invalido");
    expect(await proveedor.checkResetToken("<script>alert(1)</script>")).toBe("invalido");
  });
});

describe("resetPassword", () => {
  test("éxito: verifica el enlace, cambia la contraseña y cierra solo la sesión local", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    consultaUsuario.mockResolvedValue({ data: { rol: "pas", estado: "activo" }, error: null });
    auth.updateUser.mockResolvedValue({ data: {}, error: null });

    const r = await proveedor.resetPassword(TOKEN, "Nueva2026");

    expect(r).toEqual({ ok: true, usuarioId: "u1", rol: "pas" });
    expect(auth.verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: TOKEN });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "Nueva2026" });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  test("enlace vencido o ya usado: enlace-invalido y no cambia nada", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: null },
      error: { code: "otp_expired", status: 403 },
    });
    expect(await proveedor.resetPassword(TOKEN, "Nueva2026")).toEqual({
      ok: false,
      motivo: "enlace-invalido",
    });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  test("falla del servicio al verificar: servicio", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { user: null }, error: { status: 500 } });
    expect(await proveedor.resetPassword(TOKEN, "Nueva2026")).toEqual({
      ok: false,
      motivo: "servicio",
    });
  });

  test("cuenta suspendida: enlace-invalido, no cambia y cierra la sesión", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    consultaUsuario.mockResolvedValue({ data: { rol: "pas", estado: "suspendido" }, error: null });
    expect(await proveedor.resetPassword(TOKEN, "Nueva2026")).toEqual({
      ok: false,
      motivo: "enlace-invalido",
    });
    expect(auth.updateUser).not.toHaveBeenCalled();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  test("igual a la anterior (same_password): igual-a-la-anterior y cierra la sesión", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    consultaUsuario.mockResolvedValue({ data: { rol: "pas", estado: "activo" }, error: null });
    auth.updateUser.mockResolvedValue({
      data: null,
      error: { code: "same_password", status: 422 },
    });
    expect(await proveedor.resetPassword(TOKEN, "Vieja2026")).toEqual({
      ok: false,
      motivo: "igual-a-la-anterior",
    });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  test("política del servidor (weak_password): politica", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    consultaUsuario.mockResolvedValue({ data: { rol: "pas", estado: "activo" }, error: null });
    auth.updateUser.mockResolvedValue({
      data: null,
      error: { code: "weak_password", status: 422 },
    });
    expect(await proveedor.resetPassword(TOKEN, "debil")).toEqual({
      ok: false,
      motivo: "politica",
    });
  });
});

describe("changePassword", () => {
  beforeEach(() => {
    auth.getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "ana@hom.com.ar" } },
      error: null,
    });
  });

  test("actual incorrecta: actual-incorrecta y no actualiza", async () => {
    verificadorAuth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { code: "invalid_credentials", status: 400 },
    });
    expect(await proveedor.changePassword("u1", "mala", "Nueva2026")).toBe("actual-incorrecta");
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  test("igual a la actual: igual-a-la-anterior sin llamar a updateUser", async () => {
    verificadorAuth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    expect(await proveedor.changePassword("u1", "Vieja2026", "Vieja2026")).toBe(
      "igual-a-la-anterior",
    );
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  test("éxito: verifica con el email de la sesión, actualiza y descarta la sesión auxiliar", async () => {
    verificadorAuth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    auth.updateUser.mockResolvedValue({ data: {}, error: null });
    expect(await proveedor.changePassword("u1", "Vieja2026", "Nueva2026")).toBe("ok");
    expect(verificadorAuth.signInWithPassword).toHaveBeenCalledWith({
      email: "ana@hom.com.ar",
      password: "Vieja2026",
    });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "Nueva2026" });
    expect(verificadorAuth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  test("usuarioId distinto del de la sesión: no toca nada (CA-11)", async () => {
    expect(await proveedor.changePassword("otro", "Vieja2026", "Nueva2026")).toBe("servicio");
    expect(verificadorAuth.signInWithPassword).not.toHaveBeenCalled();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  test("sin sesión: servicio", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { status: 401 } });
    expect(await proveedor.changePassword("u1", "Vieja2026", "Nueva2026")).toBe("servicio");
  });
});
