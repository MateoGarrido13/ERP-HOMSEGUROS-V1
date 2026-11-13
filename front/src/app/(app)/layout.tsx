import type { ReactNode } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { verifySession } from "../../lib/auth/dal";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { rol } = await verifySession();
  return <AppShell rol={rol}>{children}</AppShell>;
}
