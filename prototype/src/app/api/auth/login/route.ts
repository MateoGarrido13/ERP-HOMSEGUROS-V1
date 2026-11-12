import { NextResponse } from "next/server"

import { findUserByCredentials } from "@/db/repositories/user.repository"

export const runtime = "nodejs"

const EMAIL_LIMIT = 30
const PASSWORD_LIMIT = 30

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: "Email o contraseña incorrectos." }, { status: 401 })
  }

  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!email || !password || email.length > EMAIL_LIMIT || password.length > PASSWORD_LIMIT) {
    return NextResponse.json({ message: "Email o contraseña incorrectos." }, { status: 401 })
  }

  try {
    const user = await findUserByCredentials(email, password)
    if (!user) {
      return NextResponse.json({ message: "Email o contraseña incorrectos." }, { status: 401 })
    }

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo verificar el usuario."
    const status = message.includes("DATABASE_URL") || message.startsWith("Falta ") ? 503 : 500
    return NextResponse.json(
      { message: status === 503 ? "La base de datos no está disponible." : "No se pudo verificar el usuario." },
      { status },
    )
  }
}
