import { COBERTURAS_AVISO, TIPOS_AVISO, type Aviso, type CoberturaAviso, type Lead, type TipoAviso } from "./types";

// Contrato de lectura de la bandeja (spec 4.4). El `pasId` sale siempre de la
// sesión (verifySession), nunca de la URL ni de parámetros.
export interface PendientesRepo {
  avisosDe(pasId: string): Promise<Aviso[]>;
  leadsDe(pasId: string): Promise<Lead[]>;
}

// Forma de las filas tal como las devuelve la base (ver migración aviso_lead).
export interface FilaAviso {
  id: string;
  tipo: string;
  cobertura: string;
  fecha_importancia: string;
  cliente_apellido: string;
  cliente_nombre: string;
  numero_poliza: string;
}

export interface FilaLead {
  id: string;
  origen: string;
  cliente_nombre: string;
  ramo: string;
  descripcion: string;
  actualizado_en: string;
}

function esTipoAviso(valor: string): valor is TipoAviso {
  return (TIPOS_AVISO as readonly string[]).includes(valor);
}

function esCobertura(valor: string): valor is CoberturaAviso {
  return (COBERTURAS_AVISO as readonly string[]).includes(valor);
}

// CA-9: un tipo (o cobertura) fuera de la lista no se muestra y se registra
// en el log del servidor. Conserva el orden recibido.
export function mapearAvisos(filas: FilaAviso[], registrar: (mensaje: string) => void = console.error): Aviso[] {
  const avisos: Aviso[] = [];
  for (const fila of filas) {
    if (!esTipoAviso(fila.tipo) || !esCobertura(fila.cobertura)) {
      registrar(`[pendientes] aviso ${fila.id} descartado: tipo "${fila.tipo}" o cobertura "${fila.cobertura}" desconocidos`);
      continue;
    }
    avisos.push({
      id: fila.id,
      tipo: fila.tipo,
      cobertura: fila.cobertura,
      fechaImportancia: fila.fecha_importancia,
      cliente: { apellido: fila.cliente_apellido, nombre: fila.cliente_nombre },
      numeroPoliza: fila.numero_poliza,
    });
  }
  return avisos;
}

export function mapearLeads(filas: FilaLead[]): Lead[] {
  return filas.map((fila) => ({
    id: fila.id,
    origen: fila.origen,
    clienteNombre: fila.cliente_nombre,
    ramo: fila.ramo,
    descripcion: fila.descripcion,
    actualizadoEn: fila.actualizado_en,
  }));
}
