import { cn } from "@/lib/cn"

interface ToggleProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  name?: string
}

export function Toggle({
  label,
  checked,
  onCheckedChange,
  name = "toggle",
}: ToggleProps) {
  const labelId = `${name}-label`

  return (
    <div className="flex items-center justify-between gap-3">
      <span id={labelId} className="text-sm font-medium text-slate">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        name={name}
        aria-labelledby={labelId}
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className="flex cursor-pointer items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="text-sm font-medium text-ink">{checked ? "Sí" : "No"}</span>
        <span
          className={cn(
            "flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
            checked ? "bg-primary" : "bg-field-line",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-6 rounded-full bg-white shadow-[0_1px_2px_rgba(17,2,41,0.18)] transition-transform duration-200",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </span>
      </button>
    </div>
  )
}
