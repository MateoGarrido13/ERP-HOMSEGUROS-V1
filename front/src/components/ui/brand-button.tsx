import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export const brandButtonClass = cva(
  "inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-placeholder",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-deep focus-visible:outline-primary",
        outline:
          "border border-field-line bg-white text-title hover:bg-stage focus-visible:outline-primary disabled:border-transparent",
        danger: "bg-danger-strong text-white hover:bg-danger focus-visible:outline-danger",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

interface BrandButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brandButtonClass> {}

export function BrandButton({ variant, className, type = "button", ...props }: BrandButtonProps) {
  return <button type={type} className={cn(brandButtonClass({ variant }), className)} {...props} />;
}
