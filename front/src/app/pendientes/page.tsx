import { PendientesBoard } from "@/components/pendientes/pendientes-board"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { listAutomotorLeads } from "@/services/leads/automotor-leads"

export const dynamic = "force-dynamic"

export default async function PendientesPage() {
  const leads = await listAutomotorLeads()

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Pendientes</ScreenTitle>
      <PendientesBoard initialLeads={leads} />
    </ScreenBody>
  )
}
