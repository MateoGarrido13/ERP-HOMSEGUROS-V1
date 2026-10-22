import { PendientesBoard } from "@/components/pendientes/pendientes-board"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"

export default function PendientesPage() {
  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Pendientes</ScreenTitle>
      <PendientesBoard />
    </ScreenBody>
  )
}
