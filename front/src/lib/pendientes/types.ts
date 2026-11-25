// Tipos del dominio de pendientes (ERP-17, spec 4.3). Las fechas viajan como
// texto ISO `aaaa-mm-dd` (columna `date` de Postgres), sin hora ni zona.

export const TIPOS_AVISO = ["pago-rechazado", "cumpleanos", "cotizacion-enviada", "enviar-poliza"] as const;

export type TipoAviso = (typeof TIPOS_AVISO)[number];

export const COBERTURAS_AVISO = ["Hogar", "Automotor", "Integrales"] as const;

export type CoberturaAviso = (typeof COBERTURAS_AVISO)[number];

export interface Aviso {
  id: string;
  tipo: TipoAviso;
  cobertura: CoberturaAviso;
  fechaImportancia: string;
  clienteNombre: string;
  clienteApellido: string;
  // Número de póliza registrado en la compañía (`poliza.numero_poliza`).
  numeroPoliza: string;
}

export interface Lead {
  id: string;
  origen: string;
  clienteNombre: string;
  ramo: string;
  descripcion: string;
  actualizadoEn: string;
}
