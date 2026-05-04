"use client";

import { useBookingStore, type BookingStep } from "@/store/bookingStore";
import { cn } from "@/lib/utils";

const STEPS: { key: BookingStep; label: string }[] = [
  { key: "style", label: "Style" },
  { key: "customise", label: "Customise" },
  { key: "photos", label: "Photos" },
  { key: "ai-suggest", label: "AI Suggest" },
  { key: "slot", label: "Date & Time" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
  { key: "confirm", label: "Confirm" },
];

export function BookingProgress() {
  const step = useBookingStore((s) => s.step);
  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        {STEPS.slice(0, -1).map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-colors",
                i < currentIndex
                  ? "bg-[--color-gold] border-[--color-gold] text-black"
                  : i === currentIndex
                  ? "border-[--color-gold] text-[--color-gold]"
                  : "border-[--color-border] text-[--color-on-dark-muted]"
              )}
            >
              {i < currentIndex ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 2 && (
              <div className={cn("flex-1 h-px mx-1", i < currentIndex ? "bg-[--color-gold]" : "bg-[--color-border]")} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-[--color-on-dark-muted]">
          Step {currentIndex + 1} of {STEPS.length - 1} —{" "}
          <span className="text-[--color-gold]">{STEPS[currentIndex]?.label}</span>
        </p>
      </div>
    </div>
  );
}
