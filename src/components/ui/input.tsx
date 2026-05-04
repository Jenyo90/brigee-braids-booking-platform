import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full border border-[--color-border] bg-[--color-surface-2] px-4 py-2 text-sm text-[--color-on-dark] placeholder:text-[--color-on-dark-muted] focus:outline-none focus:border-[--color-gold] focus:ring-1 focus:ring-[--color-gold] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
