"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import {
  changePassword,
  currentAccount,
  emailFieldError,
  endSession,
  homeForRole,
  initialState,
  isAuthPath,
  isPasPath,
  loadState,
  openSession,
  requestRecovery,
  resetWithToken,
  saveState,
  updateProfile,
  type AccessState,
  type LoginResult,
  type PublicAccount,
  type RecoveryRecord,
} from "@/lib/access"

interface SessionContextValue {
  ready: boolean
  account: PublicAccount | null
  recovery: RecoveryRecord | null
  login: (email: string, password: string, remember: boolean) => Promise<LoginResult>
  logout: () => void
  askRecovery: (email: string) => ReturnType<typeof requestRecovery>
  saveNewPassword: (
    token: string,
    password: string,
    confirm: string,
  ) => ReturnType<typeof resetWithToken>
  replacePassword: (
    current: string,
    password: string,
    confirm: string,
  ) => ReturnType<typeof changePassword>
  saveProfile: (name: string, phone: string) => ReturnType<typeof updateProfile>
}

const SessionContext = createContext<SessionContextValue | null>(null)
const EPHEMERAL_SESSION_KEY = "hom-access-session"

function readEphemeralSession(): AccessState["session"] {
  const raw = window.sessionStorage.getItem(EPHEMERAL_SESSION_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as AccessState["session"]
    if (!session || typeof session.email !== "string") return null
    return session
  } catch {
    return null
  }
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error("useSession tiene que usarse dentro de SessionProvider")
  }
  return value
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const stateRef = useRef<AccessState>(initialState())
  const rememberRef = useRef(true)
  const [state, setState] = useState<AccessState | null>(null)

  useEffect(() => {
    const loaded = loadState()
    if (!loaded.session) {
      const ephemeral = readEphemeralSession()
      if (ephemeral) {
        loaded.session = ephemeral
        rememberRef.current = false
      }
    }
    stateRef.current = loaded
    setState(loaded)
  }, [])

  function commit(next: AccessState) {
    stateRef.current = next
    if (rememberRef.current) {
      saveState(next)
      window.sessionStorage.removeItem(EPHEMERAL_SESSION_KEY)
    } else {
      saveState({ ...next, session: null })
      if (next.session) {
        window.sessionStorage.setItem(EPHEMERAL_SESSION_KEY, JSON.stringify(next.session))
      } else {
        window.sessionStorage.removeItem(EPHEMERAL_SESSION_KEY)
      }
    }
    setState(next)
  }

  const value: SessionContextValue = {
    ready: state !== null,
    account: state ? currentAccount(state) : null,
    recovery: state?.recovery ?? null,
    async login(email, password, remember) {
      const emailError = emailFieldError(email)
      if (emailError) return { state: stateRef.current, emailError }
      if (!password) return { state: stateRef.current, passwordError: "Completá la contraseña." }

      let response: Response
      try {
        response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        })
      } catch {
        return {
          state: stateRef.current,
          formError: "No se pudo verificar el usuario. Intentá de nuevo.",
        }
      }

      const body = (await response.json().catch(() => null)) as { email?: string; message?: string } | null
      if (!response.ok || typeof body?.email !== "string") {
        return {
          state: stateRef.current,
          formError: body?.message || "Email o contraseña incorrectos.",
          passwordError: response.status === 401 ? "Contraseña incorrecta" : undefined,
        }
      }

      const result = openSession(stateRef.current, body.email)
      rememberRef.current = remember
      commit(result.state)
      return result
    },
    logout() {
      commit(endSession(stateRef.current))
    },
    askRecovery(email) {
      const result = requestRecovery(stateRef.current, email)
      if (!result.emailError) commit(result.state)
      return result
    },
    saveNewPassword(token, password, confirm) {
      const result = resetWithToken(stateRef.current, token, password, confirm)
      if (result.ok) commit(result.state)
      return result
    },
    replacePassword(current, password, confirm) {
      const result = changePassword(stateRef.current, current, password, confirm)
      if (result.ok) commit(result.state)
      return result
    },
    saveProfile(name, phone) {
      const result = updateProfile(stateRef.current, name, phone)
      if (result.ok) commit(result.state)
      return result
    },
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function SessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, account } = useSession()
  const leavingAuth =
    account !== null &&
    (pathname === "/" || pathname === "/recuperar" || pathname === "/recuperar/correo")

  useEffect(() => {
    if (!ready) return
    if (!account) {
      if (!isAuthPath(pathname)) router.replace("/")
      return
    }
    if (pathname === "/" || pathname === "/recuperar" || pathname === "/recuperar/correo") {
      router.replace(homeForRole(account.role))
      return
    }
    if (account.role === "pas" && pathname.startsWith("/red")) {
      router.replace("/pendientes")
      return
    }
    if (account.role !== "pas" && isPasPath(pathname)) router.replace("/red")
  }, [ready, account, pathname, router])

  if (!ready) return isAuthPath(pathname) ? children : <div className="flex-1" />
  if ((!account && !isAuthPath(pathname)) || leavingAuth) {
    return <div className="flex-1" />
  }
  if (account?.role === "pas" && pathname.startsWith("/red")) return <div className="flex-1" />
  if (account && account.role !== "pas" && isPasPath(pathname)) return <div className="flex-1" />

  return children
}
