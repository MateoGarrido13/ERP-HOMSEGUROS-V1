import { describe, expect, test } from "vitest";
import {
  emailFieldError,
  inicioDelRol,
  normalizarEmail,
  passwordPolicyError,
  phoneFieldError,
} from "./validation";

describe("emailFieldError", () => {
  test("vacío", () => {
    expect(emailFieldError("")).toBe("Completá el email.");
    expect(emailFieldError("   ")).toBe("Completá el email.");
  });

  test("formato inválido", () => {
    expect(emailFieldError("martin.gomez")).toBe("El email no tiene un formato válido.");
    expect(emailFieldError("martin.gomez@hom")).toBe("El email no tiene un formato válido.");
  });

  test("válido", () => {
    expect(emailFieldError("martin.gomez@hom.com.ar")).toBeNull();
  });

  test("con mayúsculas y espacios es válido (la normalización va aparte)", () => {
    expect(emailFieldError("  Martin.Gomez@HOM.com.ar  ")).toBeNull();
  });
});

describe("normalizarEmail", () => {
  test("hace trim y pasa a minúscula", () => {
    expect(normalizarEmail("  Martin.Gomez@HOM.com.ar  ")).toBe("martin.gomez@hom.com.ar");
  });
});

describe("phoneFieldError", () => {
  test("menos de 10 dígitos", () => {
    expect(phoneFieldError("11 4321")).toBe("El teléfono tiene que tener 10 dígitos.");
  });

  test("10 dígitos es válido", () => {
    expect(phoneFieldError("11 4321-9088")).toBeNull();
  });
});

describe("passwordPolicyError", () => {
  test("menos de 8 caracteres o sin número", () => {
    expect(passwordPolicyError("corta1", "anterior")).toBe(
      "La contraseña tiene que tener al menos 8 caracteres y un número.",
    );
    expect(passwordPolicyError("sinnumeros", "anterior")).toBe(
      "La contraseña tiene que tener al menos 8 caracteres y un número.",
    );
  });

  test("igual a la anterior", () => {
    expect(passwordPolicyError("Martin2026", "Martin2026")).toBe(
      "La contraseña nueva tiene que ser distinta de la anterior.",
    );
  });

  test("válida", () => {
    expect(passwordPolicyError("Martin2027", "Martin2026")).toBeNull();
  });
});

describe("inicioDelRol", () => {
  test("PAS va a pendientes", () => {
    expect(inicioDelRol("pas")).toBe("/pendientes");
  });

  test("directivo y administrativo van a red", () => {
    expect(inicioDelRol("directivo")).toBe("/red");
    expect(inicioDelRol("administrativo")).toBe("/red");
  });
});
