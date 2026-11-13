import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

const fieldClass =
  "h-10 w-full rounded-lg border border-field bg-white px-3 text-sm text-title outline-none placeholder:text-placeholder focus:border-focus disabled:border-transparent disabled:bg-disabled disabled:text-placeholder";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, className, id, ...props }: TextFieldProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate">{label}</span>
      <input
        id={id ?? props.name}
        className={cn(
          fieldClass,
          error && "border-danger-strong focus:border-danger-strong",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-hint">{hint}</span>
      ) : null}
    </label>
  );
}
