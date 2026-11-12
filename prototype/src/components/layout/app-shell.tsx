"use client"

import { usePathname } from "next/navigation"
import { Suspense, type ReactNode } from "react"

import { SessionGate, SessionProvider, useSession } from "@/components/auth/session-provider"
import { AppHeader, StatusBar, TabBar, TabBarFallback } from "@/components/layout/app-chrome"
import { isAuthPath } from "@/lib/access"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PhoneFrame>{children}</PhoneFrame>
    </SessionProvider>
  )
}

function PhoneFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { ready, account } = useSession()
  const auth = isAuthPath(pathname)
  const showChrome = ready && account !== null && !auth

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-stage md:px-6 md:py-8"
    >
      <p className="mb-4 hidden text-sm font-medium text-muted md:block">
        HOM Seguros
      </p>
      <div className="flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-stage md:h-[min(844px,calc(100dvh-7rem))] md:rounded-[28px] md:shadow-[0_24px_60px_rgba(26,33,43,0.16)] md:ring-1 md:ring-black/5">
        {auth ? null : <StatusBar />}
        {showChrome ? <AppHeader /> : null}
        <main
          className={
            auth
              ? "flex min-h-0 flex-1 flex-col overflow-y-auto bg-white"
              : "flex min-h-0 flex-1 flex-col overflow-y-auto bg-stage"
          }
        >
          <SessionGate>{children}</SessionGate>
        </main>
        {showChrome ? (
          <Suspense fallback={<TabBarFallback />}>
            <TabBar />
          </Suspense>
        ) : null}
      </div>
    </div>
  )
}
