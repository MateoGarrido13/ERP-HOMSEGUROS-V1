import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

// Figma (fileKey dqM3vmFc3i8F3FyKIqiXvD) usa DM Sans, no Inter (ver
// bitácora de T-9 en el plan de ERP-5).
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HOM ERP",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-title">{children}</body>
    </html>
  )
}
