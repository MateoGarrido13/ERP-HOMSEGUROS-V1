"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { useSession } from "@/components/auth/session-provider"
import { roleLabels } from "@/lib/access"
import { cn } from "@/lib/cn"
import { networkTabs, screenForPath, tabs } from "@/lib/navigation"

export function StatusBar() {
  return (
    <div className="flex items-center justify-between bg-white px-6 pt-3 pb-1.5 text-black">
      <p className="text-[15px] font-semibold">9:41</p>
      <p className="text-xs font-normal">LTE&nbsp;&nbsp;84%</p>
    </div>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const { account } = useSession()
  const { kicker } = screenForPath(pathname)
  if (!account) return null

  return (
    <header className="flex items-center gap-3 border-b border-line bg-white px-4 pt-2 pb-3">
      <Image
        src="/hom-logo.png"
        alt="HOM, Profesionales en Seguros"
        width={216}
        height={73}
        priority
        className="h-[50px] w-auto shrink-0"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        {kicker ? <p className="text-xs font-normal text-muted">{kicker}</p> : null}
        <p className="text-[13px] font-medium text-ink">
          {roleLabels[account.role].short} · {account.name}
        </p>
      </div>
    </header>
  )
}

export function TabBar() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const { account } = useSession()
  const { tab: activeTab } = screenForPath(pathname)
  const items = account?.role === "pas" ? tabs : networkTabs

  return (
    <nav
      aria-label="Secciones"
      className="flex border-t border-line bg-white px-2 pt-2.5 pb-5"
    >
      {items.map((tab) => {
        const isActive = tab.id === activeTab
        const keepAutomotor =
          tab.id === "cotizar" &&
          pathname === "/cotizar/automotor" &&
          Boolean(search)
        const href = keepAutomotor ? `/cotizar/automotor?${search}` : tab.href

        return (
          <Link
            key={tab.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex min-w-0 flex-1 items-center justify-center"
          >
            <span
              className={cn(
                "max-w-full truncate rounded-full px-1.5 py-1 text-center text-[10px] leading-none font-medium",
                isActive ? "bg-primary text-white" : "text-tab",
              )}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function TabBarFallback() {
  return (
    <div className="h-[53px] border-t border-line bg-white" aria-hidden />
  )
}
