import { describe, expect, test } from "vitest";
import {
  componerTelefono,
  emailFieldError,
  nombreFieldError,
  parsearTelefono,
  PREFIJO_TELEFONICO_DEFECTO,
  telefonoLegible,
  telefonoPartesError,
  inicioDelRol,
  normalizarEmail,
  nuevaContrasenaErrors,
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

const MENSAJE_POLITICA =
  "La contraseña tiene que tener al menos 8 caracteres, con un número, una mayúscula y una minúscula.";

describe("passwordPolicyError", () => {
  test("vacía", () => {
    expect(passwordPolicyError("", "Anterior1")).toBe("Completá la contraseña nueva.");
  });

  test("menos de 8 caracteres", () => {
    expect(passwordPolicyError("Corta1a", "Anterior1")).toBe(MENSAJE_POLITICA);
  });

  test("sin número, sin mayúscula o sin minúscula", () => {
    expect(passwordPolicyError("Sinnumeros", "Anterior1")).toBe(MENSAJE_POLITICA);
    expect(passwordPolicyError("martin2027", "Martin2026")).toBe(MENSAJE_POLITICA);
    expect(passwordPolicyError("MARTIN2027", "Martin2026")).toBe(MENSAJE_POLITICA);
  });

  test("igual a la anterior", () => {
    expect(passwordPolicyError("Martin2026", "Martin2026")).toBe(
      "La contraseña nueva tiene que ser distinta de la anterior.",
    );
  });

  test("sin anterior conocida (recuperación) no compara", () => {
    expect(passwordPolicyError("Martin2026")).toBeNull();
  });

  test("válida", () => {
    expect(passwordPolicyError("Martin2027", "Martin2026")).toBeNull();
  });
});

describe("nuevaContrasenaErrors", () => {
  test("confirmación vacía", () => {
    expect(nuevaContrasenaErrors("Martin2027", "", "Martin2026")).toEqual({
      confirmError: "Completá la confirmación.",
    });
  });

  test("confirmación distinta", () => {
    expect(nuevaContrasenaErrors("Martin2027", "Martin2028")).toEqual({
      confirmError: "Las contraseñas no coinciden.",
    });
  });

  test("política incumplida y confirmación distinta marcan ambos campos", () => {
    expect(nuevaContrasenaErrors("corta", "otra")).toEqual({
      passwordError: MENSAJE_POLITICA,
      confirmError: "Las contraseñas no coinciden.",
    });
  });

  test("válida", () => {
    expect(nuevaContrasenaErrors("Martin2027", "Martin2027", "Martin2026")).toEqual({});
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

describe("nombreFieldError", () => {
  test("vacío o solo espacios", () => {
    expect(nombreFieldError("")).toBe("Completá el nombre.");
    expect(nombreFieldError("   ")).toBe("Completá el nombre.");
  });

  test("con texto es válido", () => {
    expect(nombreFieldError("  Martín ")).toBeNull();
  });
});

describe("telefonoPartesError", () => {
  const ok = { prefijo: "54", area: "11", numero: "4321-9088" };

  test("área + número con 10 dígitos (ignora espacios y guiones) es válido", () => {
    expect(telefonoPartesError(ok)).toBeNull();
    expect(telefonoPartesError({ prefijo: "54", area: "011", numero: "4321 908" })).toBeNull();
  });

  test("9 u 11 dígitos entre área y número", () => {
    const msg = "El teléfono tiene que tener 10 dígitos.";
    expect(telefonoPartesError({ ...ok, numero: "4321908" })).toBe(msg);
    expect(telefonoPartesError({ ...ok, numero: "432190888" })).toBe(msg);
    expect(telefonoPartesError({ ...ok, area: "", numero: "" })).toBe(msg);
  });

  test("prefijo que no está en la lista", () => {
    expect(telefonoPartesError({ ...ok, prefijo: "999" })).toBe("Elegí un prefijo válido.");
  });
});

describe("componerTelefono", () => {
  test("concatena prefijo, área y número como solo dígitos", () => {
    expect(componerTelefono({ prefijo: "54", area: "11", numero: "4321-9088" })).toBe("541143219088");
  });
});

describe("parsearTelefono / telefonoLegible", () => {
  test("separa un teléfono guardado con prefijo", () => {
    expect(parsearTelefono("541143219088")).toEqual({ prefijo: "54", area: "11", numero: "43219088" });
  });

  test("un teléfono de 10 dígitos sin prefijo (formato anterior) asume +54", () => {
    expect(parsearTelefono("11 4321-9088")).toEqual({
      prefijo: PREFIJO_TELEFONICO_DEFECTO,
      area: "11",
      numero: "43219088",
    });
  });

  test("prefijo de tres dígitos", () => {
    expect(parsearTelefono("5989911234567")).toEqual({ prefijo: "598", area: "99", numero: "11234567" });
  });

  test("valor vacío o irreconocible", () => {
    expect(parsearTelefono("")).toEqual({ prefijo: "54", area: "", numero: "" });
  });

  test("legible", () => {
    expect(telefonoLegible("541143219088")).toBe("+54 11 43219088");
    expect(telefonoLegible("")).toBe("—");
  });
});
