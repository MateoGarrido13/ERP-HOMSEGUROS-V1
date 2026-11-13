import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

const fieldClass =
  "h-10 w-full rounded-lg border border-field bg-white px-3 text-sm text-title outline-none placeholder:text-placeholder focus:border-focus disabled:border-transparent disabled:bg-disabled disabled:text-placeholder";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate">{label}</span>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          fieldClass,
          error && "border-danger-strong focus:border-danger-strong",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={messageId} className="text-xs text-danger">
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className="text-xs text-hint">
          {hint}
        </span>
      ) : null}
    </label>
  );
});
