/**
 * Contratos canónicos del hub de aseguradoras (Supabase Edge Functions / Deno).
 *
 * Arraigado en: ADR-001 (modelo canónico único), ADR-002 (ACL + Aggregator),
 * ADR-004 (Edge Functions hub), ADR-005 (layout y contrato HTTP),
 * ADR-008 (modelo extensible por ramo), ADR-009 (CB esqueleto con logs),
 * ADR-010 (sanitización PII), ADR-012 (marcador de estimado).
 *
 * Este archivo es la única fuente de verdad para los contratos entre capas
 * del hub. Ningún archivo de implementación debe redefinir estos tipos.
 */

export type Ramo = "AU" | "HO" | "CO" | "CC";

export type CoberturaDeseada = "terceros" | "terceros_completo" | "todo_riesgo";

export interface Conductor {
  dni: string;
  fechaNacimiento: string; // ISO 8601
}

export interface Vehiculo {
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
}

export interface Inmueble {
  direccion: string;
  tipoPropiedad: "casa" | "departamento" | "consorcio" | "comercio";
  anioConstruccion?: number;
}

/**
 * Entrada canónica. Discriminated union por ramo (ADR-008, opción 2).
 * El handler valida condicionalmente según `ramo` (ADR-007).
 */
export interface SolicitudCotizacion {
  ramo: Ramo;
  conductor: Conductor;
  coberturaDeseada: CoberturaDeseada;
  vehiculo?: Vehiculo;
  inmueble?: Inmueble;
}

/**
 * Salida canónica, una por proveedor. Estable para comparación (CU-18).
 * Campo `estimado` para distinguir stubs/mock de cotizaciones reales (ADR-012).
 * `error` contiene solo texto seguro para el usuario, sin PII (ADR-010).
 */
export interface CotizacionCanonica {
  proveedorId: string;
  prima: number; // en ARS
  moneda: "ARS" | "USD";
  cobertura: string;
  vigenciaDesde: string; // ISO 8601
  vigenciaHasta: string; // ISO 8601
  urlDetalle?: string;
  error?: string;
  estimado?: boolean;
}

/**
 * Interfaz de la Capa Anticorrupción por proveedor.
 * El Orquestador solo conoce esta interfaz; no sabe de proveedores concretos.
 */
export interface IProveedorACL {
  cotizar(
    solicitud: SolicitudCotizacion,
    signal: AbortSignal
  ): Promise<CotizacionCanonica>;
}

/**
 * Interfaz del Circuit Breaker por proveedor.
 * ADR-003: implementación diferida. v1 es esqueleto sin trip.
 * ADR-009: recordSuccess/recordFailure emiten logs estructurados.
 */
export interface ICircuitBreaker {
  proveedorId: string;
  isOpen(): boolean;
  recordSuccess(): void;
  recordFailure(): void;
}

export interface CircuitBreakerOpciones {
  umbralFallas: number;
  ventanaMs: number;
  tiempoRecuperacionMs: number;
}

/**
 * Error tipado para el hub. `code` nunca expone rutas internas ni stack.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}
