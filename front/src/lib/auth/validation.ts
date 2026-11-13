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

export function passwordPolicyError(password: string, previous: string) {
  if (password.length < 8 || !/\d/.test(password)) {
    return "La contraseña tiene que tener al menos 8 caracteres y un número.";
  }
  if (password === previous) {
    return "La contraseña nueva tiene que ser distinta de la anterior.";
  }
  return null;
}

export function inicioDelRol(rol: Rol) {
  return rol === "pas" ? "/pendientes" : "/red";
}
