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
  authenticate,
  changePassword,
  currentAccount,
  endSession,
  homeForRole,
  initialState,
  isAuthPath,
  isPasPath,
  loadState,
  requestRecovery,
  resetWithToken,
  saveState,
  updateProfile,
  type AccessState,
  type PublicAccount,
  type RecoveryRecord,
} from "@/lib/access"

interface SessionContextValue {
  ready: boolean
  account: PublicAccount | null
  recovery: RecoveryRecord | null
  login: (email: string, password: string) => ReturnType<typeof authenticate>
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

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error("useSession tiene que usarse dentro de SessionProvider")
  }
  return value
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const stateRef = useRef<AccessState>(initialState())
  const [state, setState] = useState<AccessState | null>(null)

  useEffect(() => {
    const loaded = loadState()
    stateRef.current = loaded
    setState(loaded)
  }, [])

  function commit(next: AccessState) {
    stateRef.current = next
    saveState(next)
    setState(next)
  }

  const value: SessionContextValue = {
    ready: state !== null,
    account: state ? currentAccount(state) : null,
    recovery: state?.recovery ?? null,
    login(email, password) {
      const result = authenticate(stateRef.current, email, password)
      if (result.account) commit(result.state)
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
