import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-[--color-gold] text-black",
        outline: "border border-[--color-gold] text-[--color-gold]",
        secondary: "bg-[--color-surface-3] text-[--color-on-dark-muted]",
        silver: "bg-slate-400 text-black",
        gold: "bg-[--color-gold] text-black",
        diamond: "bg-cyan-400 text-black",
        success: "bg-emerald-600 text-white",
        destructive: "bg-red-600 text-white",
        warning: "bg-amber-500 text-black",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
