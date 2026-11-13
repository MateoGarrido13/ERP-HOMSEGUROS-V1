import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return <article className={cn("w-full rounded-xl border border-line bg-white p-4", className)}>{children}</article>;
}
