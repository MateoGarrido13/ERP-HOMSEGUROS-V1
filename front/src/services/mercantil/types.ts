export interface CotizarAutomotorInput {
  patente: string
  cp: string
  localidad?: string
  uso: "particular" | "comercial"
  marca: string
  modelo: string
  anio: string
  gnc: boolean
  rastreo: boolean
  comision?: number
  bonificacion?: number
}

export interface MercantilLocalidad {
  inder: number
  codigoPostal: number
  nombre: string
  nombreProvincia: string
}

export interface MercantilVehiculo {
  codigo: number
  nombre: string
  propulsion: number
  infoauto: number
}

export interface MercantilPlan {
  numero: number
  puntaje: number
  producto: string
  texto: string
  titulo: string
  descripcion: string
  costo: number
  cantidad_cuotas: number
  desglose: unknown
  error: string
  franquicia: number
  codigo_producto: number
}

export interface MercantilCotizacionResponse {
  id: number
  rama: number
  localidad: {
    id: number
    nombre: string
    provincia: string
    codigo_postal: number
  }
  vehiculo: {
    id: number
    nombre: string
    anio: number
    valor: number
    uso: number
    gnc: boolean
    infoauto: number
    rastreo: number
  }
  suma_asegurada: number
  iva: number
  periodo: number
  cuotas: number
  comision: number
  bonificacion: number
  productor: {
    id: number
    nombre: string
  }
  cantidad: number
  resultado: MercantilPlan[]
  pago: {
    tipo_pago: string
  }
}

export interface CotizacionPlanView {
  numero: number
  producto: string
  codigoProducto: number | null
  titulo: string
  texto: string
  costo: number
  franquicia: number | null
  cantidadCuotas: number | null
}

export interface CotizacionView {
  id: string
  mercantilId: number | null
  localidadNombre: string
  provincia: string
  codigoPostal: number
  vehiculoNombre: string
  anio: number
  infoauto: number | null
  sumaAsegurada: number | null
  patente: string | null
  uso: number
  gnc: boolean
  planes: CotizacionPlanView[]
}

export class QuoteServiceError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code?: string,
  ) {
    super(message)
    this.name = "QuoteServiceError"
  }
}
