import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconAutomotor({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="8" {...iconStroke} />
      <circle cx="12" cy="12" r="2.15" {...iconStroke} />
      <path d="M12 4v5.7" {...iconStroke} />
      <path d="M6.05 15.4 10.15 13" {...iconStroke} />
      <path d="M17.95 15.4 13.85 13" {...iconStroke} />
    </IconFrame>
  )
}
