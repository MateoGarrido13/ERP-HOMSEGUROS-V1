"use client"

import { Suspense, type ReactNode } from "react"

import { AppHeader, StatusBar, TabBar, TabBarFallback } from "@/components/layout/app-chrome"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-wash md:px-6 md:py-8">
      <p className="mb-4 hidden text-sm font-light text-muted md:block">
        HOM · prototipo PAS móvil
      </p>
      <div className="flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-white md:h-[min(844px,calc(100dvh-7rem))] md:rounded-[32px] md:shadow-[0_24px_60px_rgba(17,2,41,0.12)] md:ring-1 md:ring-black/5">
        <StatusBar />
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
        <Suspense fallback={<TabBarFallback />}>
          <TabBar />
        </Suspense>
      </div>
    </div>
  )
}
