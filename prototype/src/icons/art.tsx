import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconArt({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="3.4" y="8" width="17.2" height="11.2" rx="1.6" {...iconStroke} />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" {...iconStroke} />
      <path d="M3.4 12.6h17.2" {...iconStroke} />
      <path d="M12 12.6v1.8" {...iconStroke} />
    </IconFrame>
  )
}
