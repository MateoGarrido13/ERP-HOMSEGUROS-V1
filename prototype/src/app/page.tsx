import { Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"

export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <LoginForm />
    </Suspense>
  )
}
