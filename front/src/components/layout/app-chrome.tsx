"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/cn"
import { screenForPath, tabs } from "@/lib/navigation"
import { producer } from "@/lib/mock-pas"

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
  const { kicker } = screenForPath(pathname)

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
          {producer.role} · {producer.name}
        </p>
      </div>
    </header>
  )
}

export function TabBar() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const { tab: activeTab } = screenForPath(pathname)

  return (
    <nav
      aria-label="Secciones del productor"
      className="flex border-t border-line bg-white px-2 pt-2.5 pb-5"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const href =
          tab.id === "cotizar" && search ? `${tab.href}?${search}` : tab.href

        return (
          <Link
            key={tab.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                isActive ? "bg-primary" : "bg-[#d5d5d5]",
              )}
            />
            <span
              className={cn(
                "text-center text-[9px] leading-tight font-normal tracking-wide whitespace-nowrap uppercase",
                isActive ? "text-primary" : "text-tab",
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
