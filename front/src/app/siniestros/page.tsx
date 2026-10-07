import { ClaimBoard } from "@/components/claims/claim-board"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"

export default function SiniestrosPage() {
  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Siniestros</ScreenTitle>
      <ClaimBoard />
    </ScreenBody>
  )
}
