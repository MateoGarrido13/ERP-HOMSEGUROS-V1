export type Role = "pas" | "directivo" | "administrativo"

export interface Account {
  email: string
  password: string
  name: string
  phone: string
  role: Role
  license: string
  organization: string
}

export type PublicAccount = Omit<Account, "password">

export interface SessionRecord {
  email: string
  startedAt: string
}

export interface RecoveryRecord {
  email: string
  token: string
  expiresAt: string
  used: boolean
}

export interface AuditRecord {
  at: string
  email: string
  role: Role
  action: "ingreso" | "cierre" | "cambio-contrasena" | "perfil"
}

export interface AccessState {
  users: Account[]
  session: SessionRecord | null
  recovery: RecoveryRecord | null
  audit: AuditRecord[]
}

export const roleLabels: Record<Role, { short: string; long: string }> = {
  pas: { short: "PAS", long: "Productor asesor de seguros" },
  directivo: { short: "Directivo", long: "Directivo" },
  administrativo: { short: "Administrativo", long: "Administrativo" },
}

export const passwordPolicyHint =
  "Mínimo 8 caracteres, con al menos un número, y distinta de la anterior."

export const recoveryNotice =
  "Si el email está registrado, va a llegar un mensaje para elegir una contraseña nueva."

const STORAGE_KEY = "hom-access-v1"
const RECOVERY_TTL_MS = 24 * 60 * 60 * 1000

export const seedAccounts: Account[] = [
  {
    email: "martin.gomez@hom.com.ar",
    password: "Martin2026",
    name: "Martín Gómez",
    phone: "11 4321-9088",
    role: "pas",
    license: "42.108",
    organization: "HOM Profesionales en Seguros",
  },
  {
    email: "laura.rios@hom.com.ar",
    password: "Red2026",
    name: "Laura Ríos",
    phone: "11 4321-2200",
    role: "directivo",
    license: "",
    organization: "HOM Profesionales en Seguros",
  },
  {
    email: "pablo.sosa@hom.com.ar",
    password: "Admin2026",
    name: "Pablo Sosa",
    phone: "11 4321-3311",
    role: "administrativo",
    license: "",
    organization: "HOM Profesionales en Seguros",
  },
]

export function homeForRole(role: Role) {
  return role === "pas" ? "/pendientes" : "/red"
}

export function isAuthPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/recuperar" ||
    pathname === "/recuperar/correo" ||
    pathname === "/recuperar/nueva"
  )
}

export function isPasPath(pathname: string) {
  return ["/cotizar", "/cartera", "/pendientes", "/siniestros"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function initialState(): AccessState {
  return {
    users: seedAccounts.map((account) => ({ ...account })),
    session: null,
    recovery: null,
    audit: [],
  }
}

export function toPublic(account: Account): PublicAccount {
  return {
    email: account.email,
    name: account.name,
    phone: account.phone,
    role: account.role,
    license: account.license,
    organization: account.organization,
  }
}

export interface LoginResult {
  state: AccessState
  account?: PublicAccount
  home?: string
  emailError?: string
  passwordError?: string
  formError?: string
}

export interface RecoveryRequestResult {
  state: AccessState
  notice: string
  emailError?: string | null
}

export interface ResetResult {
  state: AccessState
  ok?: true
  passwordError?: string
  confirmError?: string
  formError?: string
}

export interface PasswordChangeResult {
  state: AccessState
  ok?: true
  currentError?: string
  passwordError?: string
  confirmError?: string
  formError?: string
}

export interface ProfileUpdateResult {
  state: AccessState
  ok?: true
  nameError?: string
  phoneError?: string
  formError?: string
}

export function emailFieldError(email: string) {
  const value = email.trim()
  if (!value) return "Completá el email."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "El email no tiene un formato válido."
  }
  return null
}

export function phoneFieldError(phone: string) {
  if (phone.replace(/\D/g, "").length !== 10) {
    return "El teléfono tiene que tener 10 dígitos."
  }
  return null
}

export function passwordPolicyError(password: string, previous: string) {
  if (password.length < 8 || !/\d/.test(password)) {
    return "La contraseña tiene que tener al menos 8 caracteres y un número."
  }
  if (password === previous) {
    return "La contraseña nueva tiene que ser distinta de la anterior."
  }
  return null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function findUser(state: AccessState, email: string) {
  return state.users.find((account) => account.email === normalizeEmail(email))
}

export function currentAccount(state: AccessState): PublicAccount | null {
  if (!state.session) return null
  const account = findUser(state, state.session.email)
  return account ? toPublic(account) : null
}

function withAudit(state: AccessState, account: Account, action: AuditRecord["action"], now: Date) {
  return [
    ...state.audit,
    { at: now.toISOString(), email: account.email, role: account.role, action },
  ]
}

export function authenticate(
  state: AccessState,
  email: string,
  password: string,
  now = new Date(),
): LoginResult {
  const emailError = emailFieldError(email)
  if (emailError) return { state, emailError }
  if (!password) return { state, passwordError: "Completá la contraseña." }

  const account = findUser(state, email)
  if (!account || account.password !== password) {
    return { state, formError: "Email o contraseña incorrectos." }
  }

  const next: AccessState = {
    ...state,
    session: { email: account.email, startedAt: now.toISOString() },
    audit: withAudit(state, account, "ingreso", now),
  }

  return { state: next, account: toPublic(account), home: homeForRole(account.role) }
}

export function endSession(state: AccessState, now = new Date()): AccessState {
  const account = state.session ? findUser(state, state.session.email) : undefined
  return {
    ...state,
    session: null,
    audit: account ? withAudit(state, account, "cierre", now) : state.audit,
  }
}

export function requestRecovery(
  state: AccessState,
  email: string,
  now = new Date(),
  token = crypto.randomUUID(),
): RecoveryRequestResult {
  const emailError = emailFieldError(email)
  if (emailError) return { state, emailError, notice: "" }

  const account = findUser(state, email)
  const recovery: RecoveryRecord | null = account
    ? {
        email: account.email,
        token,
        expiresAt: new Date(now.getTime() + RECOVERY_TTL_MS).toISOString(),
        used: false,
      }
    : null

  return {
    state: { ...state, recovery },
    emailError: null,
    notice: recoveryNotice,
  }
}

interface PasswordErrors {
  passwordError?: string
  confirmError?: string
}

function newPasswordErrors(password: string, confirm: string, previous: string): PasswordErrors {
  const errors: PasswordErrors = {}
  if (!password) errors.passwordError = "Completá la contraseña nueva."
  else {
    const policy = passwordPolicyError(password, previous)
    if (policy) errors.passwordError = policy
  }
  if (!confirm) errors.confirmError = "Completá la confirmación."
  else if (password && password !== confirm) {
    errors.confirmError = "Las contraseñas no coinciden."
  }
  return errors
}

function recoveryIsOpen(state: AccessState, token: string, now: Date) {
  const recovery = state.recovery
  if (!recovery || recovery.used || recovery.token !== token) return null
  if (new Date(recovery.expiresAt).getTime() <= now.getTime()) return null
  const account = findUser(state, recovery.email)
  if (!account) return null
  return { recovery, account }
}

export function resetWithToken(
  state: AccessState,
  token: string,
  password: string,
  confirm: string,
  now = new Date(),
): ResetResult {
  const open = recoveryIsOpen(state, token, now)
  if (!open) {
    return { state, formError: "Este enlace ya no sirve. Pedí uno nuevo." }
  }

  const errors = newPasswordErrors(password, confirm, open.account.password)
  if (errors.passwordError || errors.confirmError) return { state, ...errors }

  const users = state.users.map((account) =>
    account.email === open.account.email ? { ...account, password } : account,
  )

  return {
    ok: true as const,
    state: {
      ...state,
      users,
      session: null,
      recovery: { ...open.recovery, used: true },
      audit: withAudit(state, open.account, "cambio-contrasena", now),
    },
  }
}

export function changePassword(
  state: AccessState,
  current: string,
  password: string,
  confirm: string,
  now = new Date(),
): PasswordChangeResult {
  const account = state.session ? findUser(state, state.session.email) : undefined
  if (!account) return { state, formError: "La sesión no está abierta." }

  const currentError = !current
    ? "Completá la contraseña actual."
    : account.password !== current
      ? "La contraseña actual no coincide."
      : undefined
  const errors = newPasswordErrors(password, confirm, account.password)
  if (currentError || errors.passwordError || errors.confirmError) {
    return { state, currentError, ...errors }
  }

  const users = state.users.map((item) =>
    item.email === account.email ? { ...item, password } : item,
  )

  return {
    ok: true as const,
    state: {
      ...state,
      users,
      audit: withAudit(state, account, "cambio-contrasena", now),
    },
  }
}

export function updateProfile(
  state: AccessState,
  name: string,
  phone: string,
  now = new Date(),
): ProfileUpdateResult {
  const account = state.session ? findUser(state, state.session.email) : undefined
  if (!account) return { state, formError: "La sesión no está abierta." }

  const trimmedName = name.trim()
  const nameError = trimmedName ? undefined : "Completá el nombre."
  const phoneError = phoneFieldError(phone) ?? undefined
  if (nameError || phoneError) return { state, nameError, phoneError }

  const users = state.users.map((item) =>
    item.email === account.email ? { ...item, name: trimmedName, phone: phone.trim() } : item,
  )

  return {
    ok: true as const,
    state: {
      ...state,
      users,
      audit: withAudit(state, account, "perfil", now),
    },
  }
}

export function loadState(): AccessState {
  if (typeof window === "undefined") return initialState()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return initialState()

  try {
    const parsed = JSON.parse(raw) as Partial<AccessState>
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.audit)) return initialState()
    const state: AccessState = {
      users: parsed.users,
      session: parsed.session ?? null,
      recovery: parsed.recovery ?? null,
      audit: parsed.audit,
    }
    if (state.session && !findUser(state, state.session.email)) {
      return { ...state, session: null }
    }
    return state
  } catch {
    return initialState()
  }
}

export function saveState(state: AccessState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
