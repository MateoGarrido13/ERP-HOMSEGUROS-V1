import "server-only"

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg"

declare global {
  var __homPasPool: Pool | undefined
}

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL. Definila en .env.local.")
  }

  return new Pool({
    connectionString,
    max: 10,
  })
}

export function getPool() {
  if (!globalThis.__homPasPool) {
    globalThis.__homPasPool = createPool()
  }
  return globalThis.__homPasPool
}

export async function query<T extends QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, values)
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await work(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
