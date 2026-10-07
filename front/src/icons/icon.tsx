import type { ReactNode, SVGProps } from "react"

export const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

interface IconFrameProps extends SVGProps<SVGSVGElement> {
  children: ReactNode
}

export function IconFrame({ children, className, ...props }: IconFrameProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}
