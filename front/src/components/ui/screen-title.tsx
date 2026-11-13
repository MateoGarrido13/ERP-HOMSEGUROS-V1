import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

interface ScreenTitleProps {
  children: ReactNode;
  className?: string;
}

export function ScreenTitle({ children, className }: ScreenTitleProps) {
  return (
    <h1
      className={cn(
        "font-sans text-[26px] leading-[34px] font-semibold tracking-[-0.4px] text-title",
        className,
      )}
    >
      {children}
    </h1>
  );
}
