import type { Rol } from "./types";

export function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailFieldError(email: string) {
  const value = email.trim();
  if (!value) return "Completá el email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "El email no tiene un formato válido.";
  }
  return null;
}

export function phoneFieldError(phone: string) {
  if (phone.replace(/\D/g, "").length !== 10) {
    return "El teléfono tiene que tener 10 dígitos.";
  }
  return null;
}

export const PASSWORD_POLICY_HINT =
  "Al menos 8 caracteres, con una mayúscula, una minúscula y un número.";

// Política de ERP-6 (SUP-1): mínimo 8 caracteres con un dígito, una mayúscula
// y una minúscula. `previous` es opcional: en la recuperación por enlace no se
// conoce la contraseña anterior y la comparación la hace el proveedor.
export function passwordPolicyError(password: string, previous?: string) {
  if (!password) return "Completá la contraseña nueva.";
  if (
    password.length < 8 ||
    !/\d/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password)
  ) {
    return "La contraseña tiene que tener al menos 8 caracteres, con un número, una mayúscula y una minúscula.";
  }
  if (previous !== undefined && password === previous) {
    return "La contraseña nueva tiene que ser distinta de la anterior.";
  }
  return null;
}

export interface ErroresContrasenaNueva {
  passwordError?: string;
  confirmError?: string;
}

export function nuevaContrasenaErrors(
  password: string,
  confirm: string,
  previous?: string,
): ErroresContrasenaNueva {
  const errores: ErroresContrasenaNueva = {};
  const passwordError = passwordPolicyError(password, previous);
  if (passwordError) errores.passwordError = passwordError;
  if (!confirm) errores.confirmError = "Completá la confirmación.";
  else if (confirm !== password) errores.confirmError = "Las contraseñas no coinciden.";
  return errores;
}

export function inicioDelRol(rol: Rol) {
  return rol === "pas" ? "/pendientes" : "/red";
}
