import { Suspense } from "react"

import { RecoverForm } from "@/components/auth/recover-form"

export default function RecuperarPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <RecoverForm />
    </Suspense>
  )
}
