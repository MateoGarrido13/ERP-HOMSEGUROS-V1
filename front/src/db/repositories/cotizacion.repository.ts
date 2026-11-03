import "server-only"

import type { PoolClient } from "pg"

import { query, withTransaction } from "@/db/connection"
import type {
  CotizacionPlanRecord,
  CotizacionRecord,
  CotizacionWithPlanes,
  InsertCotizacionInput,
  InsertCotizacionPlanInput,
} from "@/db/types"

interface CotizacionRow {
  id: string
  ramo: string
  company: string
  source: string
  status: string
  patente: string | null
  codigo_postal: number
  localidad_id: number | null
  localidad_nombre: string | null
  provincia: string | null
  uso: number
  marca: string | null
  modelo: string | null
  anio: number
  gnc: boolean
  rastreo: number
  iva: number
  comision: string | null
  bonificacion: string | null
  periodo: number | null
  cuotas: number | null
  tipo_pago: string | null
  productor_id: number | null
  productor_nombre: string | null
  mercantil_cotizacion_id: string | null
  rama: number | null
  infoauto: number | null
  vehiculo_id: number | null
  vehiculo_nombre: string | null
  suma_asegurada: string | null
  request_payload: unknown
  response_payload: unknown
  created_at: Date
}

interface PlanRow {
  id: string
  cotizacion_id: string
  numero: number
  producto: string | null
  codigo_producto: number | null
  titulo: string | null
  descripcion: string | null
  texto: string | null
  costo: string
  franquicia: string | null
  cantidad_cuotas: number | null
  puntaje: number | null
  error: string | null
  desglose: unknown
}

function toNumber(value: string | number | null | undefined) {
  if (value == null) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function mapCotizacion(row: CotizacionRow): CotizacionRecord {
  return {
    id: row.id,
    ramo: row.ramo,
    company: row.company,
    source: row.source,
    status: row.status,
    patente: row.patente,
    codigoPostal: row.codigo_postal,
    localidadId: row.localidad_id,
    localidadNombre: row.localidad_nombre,
    provincia: row.provincia,
    uso: row.uso,
    marca: row.marca,
    modelo: row.modelo,
    anio: row.anio,
    gnc: row.gnc,
    rastreo: row.rastreo,
    iva: row.iva,
    comision: toNumber(row.comision),
    bonificacion: toNumber(row.bonificacion),
    periodo: row.periodo,
    cuotas: row.cuotas,
    tipoPago: row.tipo_pago,
    productorId: row.productor_id,
    productorNombre: row.productor_nombre,
    mercantilCotizacionId: toNumber(row.mercantil_cotizacion_id),
    rama: row.rama,
    infoauto: row.infoauto,
    vehiculoId: row.vehiculo_id,
    vehiculoNombre: row.vehiculo_nombre,
    sumaAsegurada: toNumber(row.suma_asegurada),
    requestPayload: row.request_payload,
    responsePayload: row.response_payload,
    createdAt: row.created_at.toISOString(),
  }
}

function mapPlan(row: PlanRow): CotizacionPlanRecord {
  return {
    id: row.id,
    cotizacionId: row.cotizacion_id,
    numero: row.numero,
    producto: row.producto,
    codigoProducto: row.codigo_producto,
    titulo: row.titulo,
    descripcion: row.descripcion,
    texto: row.texto,
    costo: toNumber(row.costo) ?? 0,
    franquicia: toNumber(row.franquicia),
    cantidadCuotas: row.cantidad_cuotas,
    puntaje: row.puntaje,
    error: row.error,
    desglose: row.desglose,
  }
}

export class CotizacionRepository {
  async insertWithPlanes(
    cotizacion: InsertCotizacionInput,
    planes: InsertCotizacionPlanInput[],
  ): Promise<CotizacionWithPlanes> {
    return withTransaction(async (client) => {
      const inserted = await this.insertCotizacion(client, cotizacion)
      const savedPlanes = await this.insertPlanes(client, inserted.id, planes)
      return { ...inserted, planes: savedPlanes }
    })
  }

  async findLatestQuotedByConsulta(input: {
    patente?: string
    marca?: string
    anio?: number
  }): Promise<CotizacionWithPlanes | null> {
    const plate = (input.patente ?? "").replace(/\s+/g, "").toUpperCase()
    const marca = input.marca?.trim() ?? ""
    const anio = Number.isFinite(input.anio) ? input.anio : null
    if (!plate && !marca && anio == null) return null

    const { rows } = await query<CotizacionRow>(
      `SELECT *
         FROM cotizaciones
        WHERE status = 'quoted'
          AND company = 'mercantil'
          AND ramo = 'automotor'
          AND ($1 = '' OR regexp_replace(upper(coalesce(patente, '')), '\\s+', '', 'g') = $1)
          AND (
            $2 = ''
            OR upper(coalesce(marca, '')) = upper($2)
            OR upper(coalesce(vehiculo_nombre, '')) LIKE '%' || upper($2) || '%'
          )
          AND ($3::int IS NULL OR anio = $3)
        ORDER BY created_at DESC
        LIMIT 1`,
      [plate, marca, anio],
    )
    const row = rows[0]
    if (!row) return null
    return this.findById(row.id)
  }

  async findById(id: string): Promise<CotizacionWithPlanes | null> {
    const { rows } = await query<CotizacionRow>(
      `SELECT *
         FROM cotizaciones
        WHERE id = $1
        LIMIT 1`,
      [id],
    )
    const row = rows[0]
    if (!row) return null

    const planes = await query<PlanRow>(
      `SELECT *
         FROM cotizacion_planes
        WHERE cotizacion_id = $1
        ORDER BY numero ASC`,
      [id],
    )

    return {
      ...mapCotizacion(row),
      planes: planes.rows.map(mapPlan),
    }
  }

  async listQuoted(options?: { company?: string; ramo?: string }): Promise<CotizacionWithPlanes[]> {
    const company = options?.company ?? "mercantil"
    const ramo = options?.ramo ?? "automotor"
    const { rows } = await query<CotizacionRow>(
      `SELECT *
         FROM cotizaciones
        WHERE status = 'quoted'
          AND company = $1
          AND ramo = $2
        ORDER BY created_at DESC`,
      [company, ramo],
    )
    if (rows.length === 0) return []

    const ids = rows.map((row) => row.id)
    const planes = await query<PlanRow>(
      `SELECT *
         FROM cotizacion_planes
        WHERE cotizacion_id = ANY($1::uuid[])
        ORDER BY numero ASC`,
      [ids],
    )

    const planesByQuote = new Map<string, CotizacionPlanRecord[]>()
    for (const plan of planes.rows) {
      const mapped = mapPlan(plan)
      const current = planesByQuote.get(mapped.cotizacionId) ?? []
      current.push(mapped)
      planesByQuote.set(mapped.cotizacionId, current)
    }

    return rows.map((row) => ({
      ...mapCotizacion(row),
      planes: planesByQuote.get(row.id) ?? [],
    }))
  }

  async updateStatus(id: string, status: string) {
    const { rows } = await query<{ id: string }>(
      `UPDATE cotizaciones
          SET status = $2
        WHERE id = $1
        RETURNING id`,
      [id, status],
    )
    return rows[0]?.id ?? null
  }

  private async insertCotizacion(
    client: PoolClient,
    input: InsertCotizacionInput,
  ): Promise<CotizacionRecord> {
    const { rows } = await client.query<CotizacionRow>(
      `INSERT INTO cotizaciones (
          patente, codigo_postal, localidad_id, localidad_nombre, provincia,
          uso, marca, modelo, anio, gnc, rastreo, iva, comision, bonificacion,
          periodo, cuotas, tipo_pago, productor_id, productor_nombre,
          mercantil_cotizacion_id, rama, infoauto, vehiculo_id, vehiculo_nombre,
          suma_asegurada, request_payload, response_payload
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24,
          $25, $26::jsonb, $27::jsonb
        )
        RETURNING *`,
      [
        input.patente ?? null,
        input.codigoPostal,
        input.localidadId,
        input.localidadNombre,
        input.provincia,
        input.uso,
        input.marca ?? null,
        input.modelo ?? null,
        input.anio,
        input.gnc,
        input.rastreo,
        input.iva,
        input.comision,
        input.bonificacion,
        input.periodo,
        input.cuotas,
        input.tipoPago,
        input.productorId,
        input.productorNombre,
        input.mercantilCotizacionId,
        input.rama,
        input.infoauto,
        input.vehiculoId,
        input.vehiculoNombre,
        input.sumaAsegurada,
        JSON.stringify(input.requestPayload),
        JSON.stringify(input.responsePayload),
      ],
    )

    return mapCotizacion(rows[0])
  }

  private async insertPlanes(
    client: PoolClient,
    cotizacionId: string,
    planes: InsertCotizacionPlanInput[],
  ): Promise<CotizacionPlanRecord[]> {
    if (planes.length === 0) return []

    const saved: CotizacionPlanRecord[] = []
    for (const plan of planes) {
      const { rows } = await client.query<PlanRow>(
        `INSERT INTO cotizacion_planes (
            cotizacion_id, numero, producto, codigo_producto, titulo, descripcion,
            texto, costo, franquicia, cantidad_cuotas, puntaje, error, desglose
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, $13::jsonb
          )
          RETURNING *`,
        [
          cotizacionId,
          plan.numero,
          plan.producto,
          plan.codigoProducto,
          plan.titulo,
          plan.descripcion,
          plan.texto,
          plan.costo,
          plan.franquicia,
          plan.cantidadCuotas,
          plan.puntaje,
          plan.error,
          JSON.stringify(plan.desglose ?? null),
        ],
      )
      saved.push(mapPlan(rows[0]))
    }
    return saved
  }
}

export const cotizacionRepository = new CotizacionRepository()
