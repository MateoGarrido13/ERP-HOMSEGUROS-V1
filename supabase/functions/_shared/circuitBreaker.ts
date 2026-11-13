/**
 * Circuit Breaker esqueleto por proveedor (ADR-003 diferido; ADR-009).
 *
 * v1: `isOpen()` retorna siempre `false`. No hay trip real, half-open ni
 * corte de tráfico. `recordSuccess()` y `recordFailure()` emiten logs
 * estructurados para observabilidad futura.
 *
 * El CircuitBreakerRegistry es un Map en memoria del worker/isolate.
 * No persiste entre invocaciones de Edge Functions (no Deno.openKv).
 */

import type {
  CircuitBreakerOpciones,
  ICircuitBreaker,
} from "./types.ts";

const OPCIONES_POR_DEFECTO: CircuitBreakerOpciones = {
  umbralFallas: 5,
  ventanaMs: 10_000,
  tiempoRecuperacionMs: 30_000,
};

export class CircuitBreakerImpl implements ICircuitBreaker {
  readonly proveedorId: string;
  readonly opciones: CircuitBreakerOpciones;

  constructor(proveedorId: string, opciones?: Partial<CircuitBreakerOpciones>) {
    this.proveedorId = proveedorId;
    this.opciones = { ...OPCIONES_POR_DEFECTO, ...opciones };
  }

  isOpen(): boolean {
    // ADR-003: trip diferido. v1 nunca abre el circuito.
    return false;
  }

  recordSuccess(): void {
    // ADR-009: log estructurado de éxito (observabilidad futura).
    console.log(
      JSON.stringify({
        nivel: "info",
        evento: "circuit_breaker_success",
        proveedorId: this.proveedorId,
        timestamp: new Date().toISOString(),
      })
    );
  }

  recordFailure(): void {
    // ADR-009: log estructurado de falla (observabilidad futura).
    console.log(
      JSON.stringify({
        nivel: "warn",
        evento: "circuit_breaker_failure",
        proveedorId: this.proveedorId,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Registry de circuit breakers por proveedor. Un Map por worker/isolate.
 */
const circuitBreakerRegistry = new Map<string, CircuitBreakerImpl>();

/**
 * Obtiene o crea el CircuitBreaker para un proveedor dado.
 * Comparte la instancia entre todos los servicios que llamen a ese proveedor.
 */
export function getOrCreateCB(
  proveedorId: string,
  opciones?: CircuitBreakerOpciones
): CircuitBreakerImpl {
  let cb = circuitBreakerRegistry.get(proveedorId);
  if (!cb) {
    cb = new CircuitBreakerImpl(proveedorId, opciones);
    circuitBreakerRegistry.set(proveedorId, cb);
  }
  return cb;
}
