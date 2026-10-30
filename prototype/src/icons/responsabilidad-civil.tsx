import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconResponsabilidadCivil({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M3.2 20h17.6" {...iconStroke} />
      <rect x="4.2" y="9" width="6.4" height="11" rx="0.4" {...iconStroke} />
      <rect x="13.2" y="4.4" width="6.6" height="15.6" rx="0.4" {...iconStroke} />
      <path
        d="M5.8 11.4h1.1M7.8 11.4h1.1M5.8 13.8h1.1M7.8 13.8h1.1M14.8 6.8h1.1M16.8 6.8h1.1M14.8 9.2h1.1M16.8 9.2h1.1M14.8 11.6h1.1M16.8 11.6h1.1M14.8 14h1.1M16.8 14h1.1"
        {...iconStroke}
      />
    </IconFrame>
  )
}
