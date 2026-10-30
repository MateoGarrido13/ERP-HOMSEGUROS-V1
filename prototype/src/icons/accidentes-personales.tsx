import { IconFrame, iconStroke } from "@/icons/icon"

interface IconProps {
  className?: string
}

export function IconAccidentesPersonales({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="7" r="2.7" {...iconStroke} />
      <path
        d="M6 19.8v-1.2c0-2.8 2.4-4.8 6-4.8s6 2 6 4.8v1.2"
        {...iconStroke}
      />
    </IconFrame>
  )
}
