import "server-only"

import { appendFile } from "node:fs/promises"
import path from "node:path"

export const AUDITORIA_LOG_PATH = path.join(process.cwd(), "AUDITORIA.LOG")
export const CONSULTAS_LOG_PATH = path.join(process.cwd(), "CONSULTAS.log")

const AUDITORIA_MAX_JSON = 4000
const CONSULTAS_MAX_JSON = 200_000

export interface AuditoriaEntry {
  evento: string
  status?: number
  metodo?: string
  path?: string
  mensaje: string
  request?: unknown
  response?: unknown
  contexto?: Record<string, unknown>
}

function compact(value: unknown, max: number) {
  if (value === undefined) return undefined
  let text: string
  try {
    text = typeof value === "string" ? value : JSON.stringify(value)
  } catch {
    text = String(value)
  }
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

function formatBlock(entry: AuditoriaEntry, maxJson: number) {
  const lines = [
    `[${new Date().toISOString()}] ${entry.evento}${
      entry.status != null ? ` HTTP ${entry.status}` : ""
    }${entry.metodo ? ` ${entry.metodo}` : ""}${entry.path ? ` ${entry.path}` : ""}`,
    `mensaje: ${entry.mensaje}`,
    entry.contexto ? `contexto: ${compact(entry.contexto, maxJson)}` : null,
    entry.request ? `request: ${compact(entry.request, maxJson)}` : null,
    entry.response ? `response: ${compact(entry.response, maxJson)}` : null,
    "",
  ].filter((line): line is string => line !== null)
  return `${lines.join("\n")}\n`
}

async function appendLog(filePath: string, label: string, block: string) {
  try {
    await appendFile(filePath, block, "utf8")
  } catch (error) {
    console.error(`[${label}]`, block, error)
  }
}

export async function informarAuditoria(entry: AuditoriaEntry) {
  await appendLog(AUDITORIA_LOG_PATH, "AUDITORIA.LOG", formatBlock(entry, AUDITORIA_MAX_JSON))
}

export async function informarConsulta(entry: AuditoriaEntry) {
  await appendLog(CONSULTAS_LOG_PATH, "CONSULTAS.log", formatBlock(entry, CONSULTAS_MAX_JSON))
}
