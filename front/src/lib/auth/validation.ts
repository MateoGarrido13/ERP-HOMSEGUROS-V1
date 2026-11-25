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

// Perfil (ERP-7). El teléfono se escribe en tres partes (prefijo con bandera,
// código de área, número) y se guarda concatenado, solo dígitos.
export interface PrefijoTelefonico {
  codigo: string; // solo dígitos, sin "+"
  pais: string;
  iso: string; // para la bandera
}

export const PREFIJOS_TELEFONICOS: PrefijoTelefonico[] = [
  { codigo: "54", pais: "Argentina", iso: "AR" },
  { codigo: "598", pais: "Uruguay", iso: "UY" },
  { codigo: "56", pais: "Chile", iso: "CL" },
  { codigo: "55", pais: "Brasil", iso: "BR" },
  { codigo: "595", pais: "Paraguay", iso: "PY" },
  { codigo: "591", pais: "Bolivia", iso: "BO" },
  { codigo: "51", pais: "Perú", iso: "PE" },
  { codigo: "34", pais: "España", iso: "ES" },
  { codigo: "1", pais: "Estados Unidos", iso: "US" },
];

export const PREFIJO_TELEFONICO_DEFECTO = "54";

export interface TelefonoPartes {
  prefijo: string;
  area: string;
  numero: string;
}

const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

export function nombreFieldError(nombre: string) {
  if (!nombre.trim()) return "Completá el nombre.";
  return null;
}

export function telefonoPartesError({ prefijo, area, numero }: TelefonoPartes) {
  if (!PREFIJOS_TELEFONICOS.some((p) => p.codigo === prefijo)) {
    return "Elegí un prefijo válido.";
  }
  if (soloDigitos(area + numero).length !== 10) {
    return "El teléfono tiene que tener 10 dígitos.";
  }
  return null;
}

export function componerTelefono({ prefijo, area, numero }: TelefonoPartes) {
  return soloDigitos(prefijo) + soloDigitos(area) + soloDigitos(numero);
}

// Inverso de componerTelefono para precargar el formulario. Sin forma de
// saber dónde termina el código de área, se toman los dos primeros dígitos
// (la concatenación guardada es la misma). Un valor de 10 dígitos sin
// prefijo (formato anterior) se interpreta como +54.
export function parsearTelefono(guardado: string): TelefonoPartes {
  const digitos = soloDigitos(guardado);
  const vacio = { prefijo: PREFIJO_TELEFONICO_DEFECTO, area: "", numero: "" };
  const partir = (prefijo: string, resto: string): TelefonoPartes => ({
    prefijo,
    area: resto.slice(0, 2),
    numero: resto.slice(2),
  });

  if (digitos.length === 10) return partir(PREFIJO_TELEFONICO_DEFECTO, digitos);

  const candidatos = [...PREFIJOS_TELEFONICOS].sort((a, b) => b.codigo.length - a.codigo.length);
  for (const { codigo } of candidatos) {
    if (digitos.startsWith(codigo) && digitos.length - codigo.length === 10) {
      return partir(codigo, digitos.slice(codigo.length));
    }
  }
  return vacio;
}

export function telefonoLegible(guardado: string) {
  const partes = parsearTelefono(guardado);
  if (!partes.area && !partes.numero) return "—";
  return `+${partes.prefijo} ${partes.area} ${partes.numero}`;
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
