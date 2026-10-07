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
  children: ReactNode
}

function FieldShell({ label, error, children }: FieldShellProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-sm font-light text-body">{label}</span>
      {children}
      {error ? <span className="text-xs text-secondary">{error}</span> : null}
    </label>
  )
}

const fieldClass =
  "w-full rounded-[6px] border border-field bg-white px-3 py-2.5 text-sm font-normal text-field-text outline-none focus:border-primary"

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, className, id, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      <input
        id={id ?? props.name}
        className={cn(fieldClass, error && "border-primary", className)}
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
        className={cn(fieldClass, "resize-none", error && "border-primary", className)}
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
          className={cn(fieldClass, "appearance-none pr-8", error && "border-primary", className)}
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
