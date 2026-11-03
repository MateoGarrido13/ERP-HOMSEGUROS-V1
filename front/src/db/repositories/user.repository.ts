import "server-only"

import { query } from "@/db/connection"

export interface UserCredential {
  id: string
  email: string
}

export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<UserCredential | null> {
  const result = await query<UserCredential>(
    `SELECT id, email
     FROM "USER"
     WHERE lower(email) = lower($1)
       AND password = $2
     LIMIT 1`,
    [email, password],
  )

  return result.rows[0] ?? null
}
