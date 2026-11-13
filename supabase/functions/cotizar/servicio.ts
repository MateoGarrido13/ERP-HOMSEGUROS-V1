/**
 * Servicio de dominio para cotizaciones (prompt 04, ADR-011, ADR-001).
 *
 * Responsabilidades:
 * - Orquestar el flujo de cotización: recibir SolicitudCotizacion, delegar al Orquestador (fan-out).
 * - NO conoce SupabaseClient ni SQL (ADR-011: capa de Servicios no sabe de BD).
 * - Recibe un puerto de repository para persistencia (interfaz, // TODO diferido).
 * - NO conoce ACLs concretas ni proveedores (solo por medio del Orquestador).
 */

import type { CotizacionCanonica, SolicitudCotizacion } from "../_shared/types.ts";

/**
 * Puerto de repository para persistencia de cotizaciones.
 * La implementación concreta (con SupabaseClient) vive en la capa de Acceso a Datos.
 */
export interface ICotizacionRepository {
  registrarCotizaciones(
    solicitud: SolicitudCotizacion,
    cotizaciones: CotizacionCanonica[]
  ): Promise<void>;
}

/**
 * Implementación stub del repository (persistencia diferida).
 */
export class CotizacionRepositoryStub implements ICotizacionRepository {
  async registrarCotizaciones(): Promise<void> {
    // TODO ADR-011: implementar persistencia real en capa de Acceso a Datos.
    return;
  }
}

export class ServicioCotizacion {
  private readonly repository: ICotizacionRepository;

  constructor(repository?: ICotizacionRepository) {
    this.repository = repository ?? new CotizacionRepositoryStub();
  }

  async cotizar(
    solicitud: SolicitudCotizacion,
    cotizarEnParalelo: (
      solicitud: SolicitudCotizacion
    ) => Promise<CotizacionCanonica[]>
  ): Promise<CotizacionCanonica[]> {
    const cotizaciones = await cotizarEnParalelo(solicitud);

    // TODO ADR-011: persistir resultados una vez definido el repository concreto.
    await this.repository.registrarCotizaciones(solicitud, cotizaciones);

    return cotizaciones;
  }
}
