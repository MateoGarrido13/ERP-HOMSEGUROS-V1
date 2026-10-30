"use client"

import { useSession } from "@/components/auth/session-provider"
import { producer } from "@/lib/mock-pas"

export function useSignedName() {
  const { account } = useSession()
  return account?.name || producer.name
}

export function SignedName() {
  return <>{useSignedName()}</>
}

export function SignedLicense() {
  const { account } = useSession()
  return <>{account?.license || producer.license}</>
}
