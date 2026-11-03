import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { Pool } from "pg"

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const separator = trimmed.indexOf("=")
      if (separator <= 0) continue
      const key = trimmed.slice(0, separator)
      const value = trimmed.slice(separator + 1).replace(/^['"]|['"]$/g, "")
      if (!process.env[key]) process.env[key] = value
    }
  }
}

async function migrate() {
  loadEnv()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL")
  }

  const sql = readFileSync(resolve(process.cwd(), "src/db/schema.sql"), "utf8")
  const pool = new Pool({ connectionString })
  try {
    await pool.query(sql)
    console.log("Schema applied.")
  } finally {
    await pool.end()
  }
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
