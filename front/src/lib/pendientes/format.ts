import type { TipoAviso } from "./types";

// Zona fija (SUP-3 de ERP-17): los días se cuentan por día calendario en
// Argentina, calculados en el servidor y no en el dispositivo del PAS.
const ZONA = "America/Argentina/Buenos_Aires";

export function avisoCountLabel(cantidad: number): string {
  return cantidad === 1 ? "1 aviso" : `${cantidad} avisos`;
}

export function leadCountLabel(cantidad: number): string {
  return cantidad === 1 ? "1 lead" : `${cantidad} leads`;
}

// `aaaa-mm-dd` -> `dd/mm/aaaa`.
export function formatFecha(iso: string): string {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Día calendario de `ahora` en Buenos Aires, como `aaaa-mm-dd`.
export function fechaHoyArgentina(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

function diaAEpoca(iso: string): number {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

// RN-5: hoy = "Cargado hoy"; un día = "1 día transcurrido"; más = "N días
// transcurridos". Una fecha futura (dato inconsistente) cuenta como hoy.
export function diasTranscurridosLabel(fecha: string, hoy: string): string {
  const dias = Math.round((diaAEpoca(hoy) - diaAEpoca(fecha)) / 86_400_000);
  if (dias <= 0) return "Cargado hoy";
  return dias === 1 ? "1 día transcurrido" : `${dias} días transcurridos`;
}

const ETIQUETAS_TIPO: Record<TipoAviso, string> = {
  "pago-rechazado": "Pago rechazado",
  cumpleanos: "Cumpleaños",
  "cotizacion-enviada": "Cotización enviada",
  "enviar-poliza": "Enviar póliza",
};

export function etiquetaTipoAviso(tipo: TipoAviso): string {
  return ETIQUETAS_TIPO[tipo];
}

export interface Pagina<T> {
  items: T[];
  pagina: number;
  totalPaginas: number;
}

// Paginación en memoria: la lista ya viene filtrada por PAS desde el servidor.
export function paginar<T>(items: T[], pagina: number, tamano: number): Pagina<T> {
  const totalPaginas = Math.max(1, Math.ceil(items.length / tamano));
  const actual = Math.min(Math.max(1, Math.trunc(pagina) || 1), totalPaginas);
  const desde = (actual - 1) * tamano;
  return { items: items.slice(desde, desde + tamano), pagina: actual, totalPaginas };
}
