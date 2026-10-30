import type { Metadata } from "next"
import { DM_Sans, Inter } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { AppShell } from "@/components/layout/app-shell"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HOM · PAS",
  description:
    "Prototipo móvil del productor asesor de seguros. Cotización, propuesta, cartera, pendientes y siniestros.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-dvh font-sans text-ink">
        <NuqsAdapter>
          <AppShell>{children}</AppShell>
        </NuqsAdapter>
      </body>
    </html>
  )
}
