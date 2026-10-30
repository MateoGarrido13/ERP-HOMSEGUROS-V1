import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconHogar({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M3.8 11.2 12 4.2l8.2 7" {...iconStroke} />
      <path d="M6.2 10.4V19.6h11.6V10.4" {...iconStroke} />
      <path d="M10.2 19.6v-4.3h3.6v4.3" {...iconStroke} />
    </IconFrame>
  )
}
