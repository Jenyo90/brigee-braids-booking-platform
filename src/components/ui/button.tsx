"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-gold] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-wide uppercase text-xs",
  {
    variants: {
      variant: {
        default: "bg-[--color-gold] text-black hover:bg-[--color-gold-light] active:bg-[--color-gold-dark]",
        outline: "border border-[--color-gold] text-[--color-gold] hover:bg-[--color-gold] hover:text-black",
        ghost: "text-[--color-on-dark] hover:bg-[--color-surface-2]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        secondary: "bg-[--color-surface-2] text-[--color-on-dark] hover:bg-[--color-surface-3] border border-[--color-border]",
        link: "text-[--color-gold] underline-offset-4 hover:underline uppercase-none normal-case text-sm",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
