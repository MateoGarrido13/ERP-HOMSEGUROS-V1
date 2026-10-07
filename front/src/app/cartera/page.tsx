import { Suspense } from "react"

import { ClientSearch } from "@/components/portfolio/client-search"
import { RamoChart } from "@/components/portfolio/ramo-chart"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { portfolioPolicies, ramoShares } from "@/lib/portfolio"

export default function CarteraPage() {
  const shares = ramoShares(portfolioPolicies)

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Cartera</ScreenTitle>
      <RamoChart shares={shares} total={portfolioPolicies.length} />
      <Suspense fallback={<p className="text-sm font-light text-muted">Cargando clientes…</p>}>
        <ClientSearch />
      </Suspense>
    </ScreenBody>
  )
}
