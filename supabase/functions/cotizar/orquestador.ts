/**
 * Orquestador de fan-out paralelo para cotizaciones (prompt 05, ADR-002, ADR-004, ADR-009).
 *
 * Responsabilidades:
 * - Llamar en paralelo a todas las ACL de proveedores (`IProveedorACL`).
 * - Usar `Promise.allSettled` (nunca `Promise.all`): una caída no cancela las demás.
 * - Timeout global de 4 segundos con `AbortController`.
 * - Límite máximo de proveedores concurrentes (anti-DoS).
 * - No conoce proveedores concretos: solo `IProveedorACL`.
 * - No implementa circuit breaker real (ADR-003 diferido); cada ACL gestiona su propio CB.
 */

import type { CotizacionCanonica, IProveedorACL, SolicitudCotizacion } from "../_shared/types.ts";

const TIEMPO_ESPERA_GLOBAL_MS = 4_000; // 4 segundos, ADR-004
const LIMITE_PROVEEDORES_CONCURRENTES = 10; // ADR-009 anti-DoS

export class Orquestador {
  private readonly proveedores: IProveedorACL[];

  constructor(proveedores: IProveedorACL[]) {
    this.proveedores = proveedores;
  }

  async cotizarEnParalelo(
    solicitud: SolicitudCotizacion
  ): Promise<CotizacionCanonica[]> {
    // Anti-DoS: limitar cantidad de proveedores concurrentes (ADR-009).
    if (this.proveedores.length > LIMITE_PROVEEDORES_CONCURRENTES) {
      throw new Error(
        `Demasiados proveedores concurrentes: ${this.proveedores.length} > ${LIMITE_PROVEEDORES_CONCURRENTES}`
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      TIEMPO_ESPERA_GLOBAL_MS
    );

    try {
      const resultados = await Promise.allSettled(
        this.proveedores.map((proveedor) =>
          proveedor.cotizar(solicitud, controller.signal)
        )
      );

      return resultados.map((resultado, i) => {
        if (resultado.status === "fulfilled") {
          return resultado.value;
        }

        // Proveedor falló o fue abortado: devolvemos cotización con error (degradación graceful).
        const proveedorId = this.proveedores[i]?.constructor.name ?? "desconocido";
        return {
          proveedorId,
          prima: 0,
          moneda: "ARS",
          cobertura: "",
          vigenciaDesde: new Date().toISOString(),
          vigenciaHasta: new Date().toISOString(),
          error: resultado.reason instanceof Error
            ? resultado.reason.message
            : "proveedor no disponible",
          estimado: false,
        };
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
