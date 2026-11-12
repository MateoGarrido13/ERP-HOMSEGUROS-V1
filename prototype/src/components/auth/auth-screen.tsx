import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

interface AuthScreenProps {
  backHref?: string
  children: ReactNode
}

export function AuthScreen({ backHref, children }: AuthScreenProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white px-6 pt-5 pb-6">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1 self-start text-sm text-slate"
        >
          <Chevron />
          Volver
        </Link>
      ) : null}
      <Image
        src="/hom-logo.png"
        alt="HOM, Profesionales en Seguros"
        width={216}
        height={73}
        priority
        className="mx-auto h-16 w-auto"
      />
      <div className="mt-8 flex flex-col gap-5">{children}</div>
      <p className="mt-auto pt-10 text-center text-xs text-hint">Portal PAS · HOM Seguros</p>
    </div>
  )
}

export function AuthTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-center font-sans text-[22px] leading-tight font-semibold tracking-tight text-title">
      {children}
    </h1>
  )
}

export function AuthLead({ children }: { children: ReactNode }) {
  return <p className="text-center text-sm leading-snug text-slate">{children}</p>
}

export function AuthAlert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-xl border border-danger-line bg-white px-3 py-2.5 text-sm text-danger"
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-danger-strong" />
      {children}
    </p>
  )
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      <path
        d="M7.5 2.5 4 6l3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
