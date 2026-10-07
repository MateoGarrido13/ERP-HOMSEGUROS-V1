import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconComercio({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4.2 9.4 6.2 4.6h11.6l2 4.8" {...iconStroke} />
      <path
        d="M4.2 9.4c.9 1.15 1.9 1.15 2.7 0 .8 1.15 1.8 1.15 2.6 0 .8 1.15 1.8 1.15 2.7 0 .9 1.15 1.9 1.15 2.6 0 .7 1.15 1.7 1.15 2.6 0 .8 1.15 1.6 1.15 2.4 0"
        {...iconStroke}
      />
      <path d="M5.6 11.2V19.6h12.8V11.2" {...iconStroke} />
      <path d="M10.2 19.6v-3.6h3.6v3.6" {...iconStroke} />
    </IconFrame>
  )
}
