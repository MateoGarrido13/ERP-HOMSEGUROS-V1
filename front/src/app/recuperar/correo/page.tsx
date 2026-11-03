import { Suspense } from "react"

import { MailInbox } from "@/components/auth/mail-inbox"

export default function CorreoPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <MailInbox />
    </Suspense>
  )
}
