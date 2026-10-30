import { Suspense } from "react"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function NuevaContrasenaPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
