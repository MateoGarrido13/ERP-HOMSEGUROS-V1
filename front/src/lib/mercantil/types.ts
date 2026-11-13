/**
 * Tipos de la API de Mercantil Andina (apidev.mercantilandina.com.ar).
 *
 * Basado en REQUEST-COTIZAR-AUTO.md y SUBSCRIPCIONES.md de
 * ERP ASEGURADORA/APIS/MercantilAndina.
 */

export type MercantilTipoVehiculo = "AUTO" | "MOTO";

export interface MercantilLocalidad {
  id: number;          // campo "inder" del vendor
  nombre: string;
  codigo_postal?: number;
}

export interface MercantilVehiculo {
  infoauto: number;
  nombre: string;
  anio: number;
  tipo: MercantilTipoVehiculo;
  uso: number;
  gnc: boolean;
  rastreo: number;
}

export interface MercantilCredencialesRequest {
  client_id: string;
  username: string;
  password: string;
  grant_type: string;
}

export interface MercantilCredencialesResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
}

export interface MercantilCotizarAutoRequest {
  localidad: {
    codigo_postal: number;
    id: number;
  };
  vehiculo: {
    infoauto: number;
    anio: number;
    uso: number;
    gnc: boolean;
    rastreo: number;
  };
  comision: number;
  bonificacion: number;
  periodo: number;
  cuotas: number;
  pago: { tipo_pago: "C" };
  ajuste_suma: number;
  iva: number;
  desglose: boolean;
  productor: { id: number };
}

export interface MercantilPlan {
  id: string;
  nombre: string;
  prima: number;
  iva: number;
  total: number;
  cuota?: number;
}

export interface MercantilCotizarAutoResponse {
  id: string;             // cotizacion_id / uuid interno del ERP
  mercantilId: number;    // id de cotización en Mercantil Andina
  vehiculoNombre: string;
  sumaAsegurada: number;
  planes: number;
  planDetalle?: MercantilPlan[];
}

export interface MercantilError {
  status: number;
  message: string;
  body?: unknown;
}
