import { cn } from "@/lib/cn"

interface ChoiceOption {
  id: string
  label: string
}

interface ChoiceFieldProps {
  label: string
  name: string
  value: string | null
  options: ChoiceOption[]
  onChange: (value: string) => void
  error?: string
}

export function ChoiceField({
  label,
  name,
  value,
  options,
  onChange,
  error,
}: ChoiceFieldProps) {
  const labelId = `${name}-label`

  return (
    <div
      id={name}
      role="radiogroup"
      aria-labelledby={labelId}
      aria-invalid={error ? true : undefined}
      className="flex w-full flex-col gap-1.5"
    >
      <p id={labelId} className="text-sm font-light text-body">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const checked = value === option.id

          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[6px] border px-3 py-2.5 text-sm",
                checked ? "border-primary bg-[#fff8ee]" : "border-field bg-white",
                error && !checked && "border-primary",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="size-4 accent-primary"
              />
              <span className="font-normal text-field-text">{option.label}</span>
            </label>
          )
        })}
      </div>
      {error ? <span className="text-xs text-secondary">{error}</span> : null}
    </div>
  )
}
