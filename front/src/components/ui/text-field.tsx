import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"

import { cn } from "@/lib/cn"

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

function FieldShell({ label, error, hint, children }: FieldShellProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-sm font-medium text-slate">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-hint">{hint}</span>
      ) : null}
    </label>
  )
}

const fieldClass =
  "h-10 w-full rounded-lg border border-field bg-white px-3 text-sm text-title outline-none placeholder:text-placeholder focus:border-focus disabled:border-transparent disabled:bg-disabled disabled:text-placeholder"

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  variant?: "default" | "portal"
}

export function TextField({
  label,
  error,
  hint,
  variant: _variant = "default",
  className,
  id,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <input
        id={id ?? props.name}
        className={cn(
          fieldClass,
          error && "border-danger-strong focus:border-danger-strong",
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextArea({ label, error, className, id, ...props }: TextAreaProps) {
  return (
    <FieldShell label={label} error={error}>
      <textarea
        id={id ?? props.name}
        rows={3}
        className={cn(
          fieldClass,
          "h-auto resize-none py-2.5",
          error && "border-danger-strong focus:border-danger-strong",
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function SelectField({
  label,
  error,
  className,
  children,
  id,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      <span className="relative block">
        <select
          id={id ?? props.name}
          className={cn(
            fieldClass,
            "appearance-none pr-8",
            error && "border-danger-strong focus:border-danger-strong",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-muted"
        >
          ▼
        </span>
      </span>
    </FieldShell>
  )
}
