export interface CotizacionRecord {
  id: string
  ramo: string
  company: string
  source: string
  status: string
  patente: string | null
  codigoPostal: number
  localidadId: number | null
  localidadNombre: string | null
  provincia: string | null
  uso: number
  marca: string | null
  modelo: string | null
  anio: number
  gnc: boolean
  rastreo: number
  iva: number
  comision: number | null
  bonificacion: number | null
  periodo: number | null
  cuotas: number | null
  tipoPago: string | null
  productorId: number | null
  productorNombre: string | null
  mercantilCotizacionId: number | null
  rama: number | null
  infoauto: number | null
  vehiculoId: number | null
  vehiculoNombre: string | null
  sumaAsegurada: number | null
  requestPayload: unknown
  responsePayload: unknown
  createdAt: string
}

export interface CotizacionPlanRecord {
  id: string
  cotizacionId: string
  numero: number
  producto: string | null
  codigoProducto: number | null
  titulo: string | null
  descripcion: string | null
  texto: string | null
  costo: number
  franquicia: number | null
  cantidadCuotas: number | null
  puntaje: number | null
  error: string | null
  desglose: unknown
}

export interface CotizacionWithPlanes extends CotizacionRecord {
  planes: CotizacionPlanRecord[]
}

export interface InsertCotizacionInput {
  patente?: string | null
  codigoPostal: number
  localidadId: number | null
  localidadNombre: string | null
  provincia: string | null
  uso: number
  marca?: string | null
  modelo?: string | null
  anio: number
  gnc: boolean
  rastreo: number
  iva: number
  comision: number
  bonificacion: number
  periodo: number
  cuotas: number
  tipoPago: string
  productorId: number
  productorNombre: string | null
  mercantilCotizacionId: number
  rama: number | null
  infoauto: number | null
  vehiculoId: number | null
  vehiculoNombre: string | null
  sumaAsegurada: number | null
  requestPayload: unknown
  responsePayload: unknown
}

export interface InsertCotizacionPlanInput {
  numero: number
  producto: string | null
  codigoProducto: number | null
  titulo: string | null
  descripcion: string | null
  texto: string | null
  costo: number
  franquicia: number | null
  cantidadCuotas: number | null
  puntaje: number | null
  error: string | null
  desglose: unknown
}
