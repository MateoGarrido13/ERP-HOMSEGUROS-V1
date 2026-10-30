import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/cn"

export const brandButtonClass = cva(
  "flex w-full cursor-pointer items-center justify-center rounded-full px-6 py-3.5 font-display text-base font-normal text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary",
        whatsapp: "bg-whatsapp",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
)

interface BrandButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brandButtonClass> {}

export function BrandButton({
  variant,
  className,
  type = "button",
  ...props
}: BrandButtonProps) {
  return (
    <button
      type={type}
      className={cn(brandButtonClass({ variant }), className)}
      {...props}
    />
  )
}

interface BrandButtonLinkProps extends VariantProps<typeof brandButtonClass> {
  href: string
  children: ReactNode
  className?: string
}

export function BrandButtonLink({
  href,
  variant,
  className,
  children,
}: BrandButtonLinkProps) {
  return (
    <Link href={href} className={cn(brandButtonClass({ variant }), className)}>
      {children}
    </Link>
  )
}
