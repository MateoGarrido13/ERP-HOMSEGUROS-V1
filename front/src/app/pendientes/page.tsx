import { LeadBoard } from "@/components/pendientes/lead-board"
import { PendingBoard } from "@/components/pendientes/pending-board"
import { ScreenBody } from "@/components/ui/screen-body"
import { ScreenTitle } from "@/components/ui/screen-title"
import { leads } from "@/lib/leads"
import { pendingNotices } from "@/lib/pendientes"

export default function PendientesPage() {
  const notices = pendingNotices.length
  const leadCount = leads.length

  return (
    <ScreenBody className="gap-2.5">
      <ScreenTitle className="text-[22px]">Pendientes</ScreenTitle>
      <p className="text-[13px] font-light text-body">
        {notices === 1 ? "1 aviso" : `${notices} avisos`}
      </p>
      <PendingBoard />
      <section className="mt-4 flex flex-col gap-2.5">
        <h2 className="font-display text-[22px] leading-normal font-bold text-black">Leads</h2>
        <p className="text-[13px] font-light text-body">
          {leadCount === 1 ? "1 lead" : `${leadCount} leads`}
        </p>
        <LeadBoard />
      </section>
    </ScreenBody>
  )
}
