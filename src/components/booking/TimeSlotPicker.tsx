"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { cn, formatTime } from "@/lib/utils";
import { useBookingStore } from "@/store/bookingStore";
import type { TimeSlot } from "@/types/database";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
}

export function TimeSlotPicker({ slots }: TimeSlotPickerProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { selectedSlot, setSelectedSlot } = useBookingStore();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotsForDay = (day: Date) =>
    slots.filter((s) => isSameDay(parseISO(s.date), day) && s.is_available);

  return (
    <div>
      {/* Week navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="p-2 border border-[--color-border] hover:border-[--color-gold] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {format(weekStart, "d MMM")} – {format(addDays(weekStart, 6), "d MMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="p-2 border border-[--color-border] hover:border-[--color-gold] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <p className="text-xs text-[--color-on-dark-muted] uppercase tracking-wider mb-1">
              {format(day, "EEE")}
            </p>
            <p className="text-sm font-medium mb-2">{format(day, "d")}</p>
            <div className="flex flex-col gap-1">
              {getSlotsForDay(day).map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "w-full py-1.5 text-xs border transition-colors",
                    selectedSlot?.id === slot.id
                      ? "bg-[--color-gold] border-[--color-gold] text-black font-semibold"
                      : "border-[--color-border] hover:border-[--color-gold] hover:text-[--color-gold]"
                  )}
                >
                  {formatTime(slot.start_time)}
                </button>
              ))}
              {getSlotsForDay(day).length === 0 && (
                <div className="py-1.5 text-xs text-[--color-on-dark-muted] text-center">—</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <p className="text-sm text-[--color-gold] text-center mt-4">
          Selected: {format(parseISO(selectedSlot.date), "EEEE, d MMMM")} at {formatTime(selectedSlot.start_time)}
        </p>
      )}
    </div>
  );
}
