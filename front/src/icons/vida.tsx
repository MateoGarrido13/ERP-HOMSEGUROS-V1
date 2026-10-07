import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconVida({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path
        d="M12 19.6c-3.6-2.5-6.4-5-6.4-8.1A3.35 3.35 0 0 1 12 8.3a3.35 3.35 0 0 1 6.4 3.2c0 3.1-2.8 5.6-6.4 8.1Z"
        {...iconStroke}
      />
      <path
        d="M2.6 12.4h3.2l1.5-2.5 2.2 4.3 1.5-2.6h2.6l1.1 1.5H21.4"
        {...iconStroke}
      />
    </IconFrame>
  )
}
