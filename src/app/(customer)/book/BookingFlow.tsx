"use client";

import { useEffect } from "react";
import { BookingProgress } from "@/components/booking/BookingWizard";
import { StyleCard } from "@/components/booking/StyleCard";
import { PhotoUpload } from "@/components/booking/PhotoUpload";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBookingStore } from "@/store/bookingStore";
import { formatAUDFromDollars, calculateDeposit, formatDate, formatTime } from "@/lib/utils";
import type { Style, TimeSlot } from "@/types/database";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { PaymentStep } from "./PaymentStep";

interface BookingFlowProps {
  styles: Style[];
  slots: TimeSlot[];
  userId: string;
}

export function BookingFlow({ styles, slots, userId }: BookingFlowProps) {
  const {
    step, setStep,
    selectedStyle, setSelectedStyle,
    customisation, setCustomisation,
    inspirationPhotos,
    aiSuggestions, setAISuggestions,
    selectedSlot,
    isRecurring, setIsRecurring,
    recurrenceRule, setRecurrenceRule,
    appointmentId, setAppointmentId,
    paymentIntentClientSecret, setPaymentIntentClientSecret,
    reset,
  } = useBookingStore();

  const [aiLoading, setAILoading] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  const depositAmount = selectedStyle
    ? calculateDeposit(
        (selectedStyle.price_min + selectedStyle.price_max) / 2
      )
    : 0;

  const handleAISuggest = async () => {
    if (!inspirationPhotos.length) return;
    setAILoading(true);
    setAIError(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: inspirationPhotos[0] }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setAISuggestions(data.suggestions);
        setStep("slot");
      } else {
        setAIError("Could not generate suggestions. You can skip this step.");
      }
    } catch {
      setAIError("Something went wrong. You can skip this step.");
    }
    setAILoading(false);
  };

  const handleCreateAppointment = async () => {
    if (!selectedStyle || !selectedSlot || appointmentLoading) return;
    setAppointmentLoading(true);
    const avgPrice = (selectedStyle.price_min + selectedStyle.price_max) / 2;

    const res = await fetch("/api/stripe/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styleId: selectedStyle.id,
        slotId: selectedSlot.id,
        braid_length: customisation.braidLength,
        colour: customisation.colour,
        thickness: customisation.thickness,
        notes: customisation.notes,
        inspiration_photos: inspirationPhotos,
        ai_suggestion: aiSuggestions.length ? aiSuggestions[0] : null,
        total_amount: avgPrice,
        deposit_amount: depositAmount,
        is_recurring: isRecurring,
        recurrence_rule: recurrenceRule,
        userId,
      }),
    });

    const data = await res.json();
    if (data.clientSecret && data.appointmentId) {
      setPaymentIntentClientSecret(data.clientSecret);
      setAppointmentId(data.appointmentId);
      setStep("payment");
    }
    setAppointmentLoading(false);
  };

  // STYLE STEP
  if (step === "style") {
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-6">Choose your style</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {styles.map((s) => (
            <StyleCard
              key={s.id}
              style={s}
              selected={selectedStyle?.id === s.id}
              onSelect={(style) => { setSelectedStyle(style); setStep("customise"); }}
            />
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => setStep("customise")} disabled={!selectedStyle}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // CUSTOMISE STEP
  if (step === "customise") {
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-6">Customise your look</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Braid Length</label>
            <Select value={customisation.braidLength} onValueChange={(v) => setCustomisation({ braidLength: v })}>
              <SelectTrigger><SelectValue placeholder="Select length" /></SelectTrigger>
              <SelectContent>
                {["Shoulder length", "Armpit length", "Mid-back length", "Bum length", "Waist length"].map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Colour</label>
            <Select value={customisation.colour} onValueChange={(v) => setCustomisation({ colour: v })}>
              <SelectTrigger><SelectValue placeholder="Select colour" /></SelectTrigger>
              <SelectContent>
                {(selectedStyle?.colour_suggestions ?? ["#1B", "1B/30", "1B/27", "Burgundy", "Honey Blonde", "Other"]).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Thickness</label>
            <Select value={customisation.thickness} onValueChange={(v) => setCustomisation({ thickness: v })}>
              <SelectTrigger><SelectValue placeholder="Select thickness" /></SelectTrigger>
              <SelectContent>
                {["Extra Small (XS)", "Small", "Medium", "Large", "Jumbo"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[--color-on-dark-muted] mb-1.5 block">Additional Notes (optional)</label>
            <textarea
              className="w-full bg-[--color-surface-2] border border-[--color-border] focus:border-[--color-gold] focus:ring-1 focus:ring-[--color-gold] outline-none p-3 text-sm text-[--color-on-dark] placeholder:text-[--color-on-dark-muted] resize-none h-24"
              placeholder="Any special requests, hair health notes, etc."
              value={customisation.notes}
              onChange={(e) => setCustomisation({ notes: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep("style")}>Back</Button>
          <Button onClick={() => setStep("photos")}>Continue</Button>
        </div>
      </div>
    );
  }

  // PHOTOS STEP
  if (step === "photos") {
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-2">Upload inspiration photos</h2>
        <p className="text-sm text-[--color-on-dark-muted] mb-6">
          Show us styles you love. We&apos;ll use them for AI suggestions and as a reference for your appointment.
        </p>
        <PhotoUpload />
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep("customise")}>Back</Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("slot")}>
              Skip
            </Button>
            <Button onClick={() => setStep("ai-suggest")} disabled={!inspirationPhotos.length}>
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Suggestions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // AI SUGGEST STEP
  if (step === "ai-suggest") {
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-2">AI Style Suggestions</h2>
        <p className="text-sm text-[--color-on-dark-muted] mb-6">
          Our AI will analyse your inspiration photos and suggest styles that suit your face shape and hair type.
        </p>

        {!aiSuggestions.length && (
          <div className="text-center py-8">
            <Button onClick={handleAISuggest} disabled={aiLoading} size="lg">
              {aiLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analysing…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate Suggestions</>
              )}
            </Button>
            {aiError && <p className="text-red-400 text-xs mt-3">{aiError}</p>}
          </div>
        )}

        {aiSuggestions.length > 0 && (
          <div className="space-y-3 mb-6">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="border border-[--color-border] bg-[--color-surface-2] p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-serif text-lg font-semibold">{s.style}</p>
                  <Badge variant="outline">{Math.round(s.confidence * 100)}% match</Badge>
                </div>
                <p className="text-sm text-[--color-on-dark-muted] mb-2">{s.reason}</p>
                <div className="flex gap-4 text-xs text-[--color-gold]">
                  <span>~{s.estimatedHours}h install</span>
                  <span>{s.estimatedPacks} packs hair</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep("photos")}>Back</Button>
          <Button onClick={() => setStep("slot")}>
            {aiSuggestions.length ? "Continue with These Suggestions" : "Skip to Date & Time"}
          </Button>
        </div>
      </div>
    );
  }

  // SLOT STEP
  if (step === "slot") {
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-6">Choose date & time</h2>
        <TimeSlotPicker slots={slots} />

        {/* Recurring option */}
        <div className="mt-6 border border-[--color-border] p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="accent-[--color-gold]"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="text-sm font-medium">Make this a recurring appointment</span>
          </label>
          {isRecurring && (
            <div className="mt-3">
              <Select value={recurrenceRule ?? ""} onValueChange={(v) => setRecurrenceRule(v)}>
                <SelectTrigger><SelectValue placeholder="Repeat frequency" /></SelectTrigger>
                <SelectContent>
                  {["Weekly", "Fortnightly", "Monthly"].map((r) => (
                    <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[--color-on-dark-muted] mt-2">
                A deposit is required to lock your recurring slot.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep("ai-suggest")}>Back</Button>
          <Button onClick={() => setStep("review")} disabled={!selectedSlot}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // REVIEW STEP
  if (step === "review") {
    const avg = selectedStyle ? (selectedStyle.price_min + selectedStyle.price_max) / 2 : 0;
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-6">Review your booking</h2>
        <div className="border border-[--color-border] divide-y divide-[--color-border]">
          <div className="p-4 flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-[--color-on-dark-muted]">Style</span>
            <span className="text-sm font-medium text-right">{selectedStyle?.name}</span>
          </div>
          <div className="p-4 flex justify-between">
            <span className="text-xs uppercase tracking-wider text-[--color-on-dark-muted]">Customisation</span>
            <div className="text-sm text-right">
              {customisation.braidLength && <p>{customisation.braidLength}</p>}
              {customisation.colour && <p>Colour: {customisation.colour}</p>}
              {customisation.thickness && <p>Thickness: {customisation.thickness}</p>}
            </div>
          </div>
          {selectedSlot && (
            <div className="p-4 flex justify-between">
              <span className="text-xs uppercase tracking-wider text-[--color-on-dark-muted]">Date & Time</span>
              <div className="text-sm text-right">
                <p>{formatDate(selectedSlot.date)}</p>
                <p className="text-[--color-on-dark-muted]">{formatTime(selectedSlot.start_time)}</p>
              </div>
            </div>
          )}
          {isRecurring && (
            <div className="p-4 flex justify-between">
              <span className="text-xs uppercase tracking-wider text-[--color-on-dark-muted]">Recurring</span>
              <span className="text-sm capitalize">{recurrenceRule}</span>
            </div>
          )}
          <div className="p-4 flex justify-between">
            <span className="text-xs uppercase tracking-wider text-[--color-on-dark-muted]">Estimated Total</span>
            <span className="text-sm">{formatAUDFromDollars(avg)}</span>
          </div>
          <div className="p-4 flex justify-between bg-[--color-surface-3]">
            <span className="text-xs uppercase tracking-wider text-[--color-gold]">Deposit Due Now (10%)</span>
            <span className="text-sm font-semibold text-[--color-gold]">{formatAUDFromDollars(depositAmount)}</span>
          </div>
        </div>

        <p className="text-xs text-[--color-on-dark-muted] mt-4">
          By proceeding you agree to our cancellation policy. 24-hour notice required to avoid deposit forfeiture.
        </p>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep("slot")}>Back</Button>
          <Button onClick={handleCreateAppointment} disabled={appointmentLoading}>
            Proceed to Payment
          </Button>
        </div>
      </div>
    );
  }

  // PAYMENT STEP
  if (step === "payment" && paymentIntentClientSecret) {
    return (
      <div>
        <BookingProgress />
        <h2 className="font-serif text-2xl mb-2">Secure Payment</h2>
        <p className="text-sm text-[--color-on-dark-muted] mb-6">
          Pay your <span className="text-[--color-gold] font-semibold">{formatAUDFromDollars(depositAmount)}</span> deposit to confirm your booking.
        </p>
        <PaymentStep clientSecret={paymentIntentClientSecret} appointmentId={appointmentId!} />
      </div>
    );
  }

  // CONFIRM STEP
  if (step === "confirm") {
    return (
      <div className="text-center py-12">
        <BookingProgress />
        <div className="w-20 h-20 border border-[--color-gold] flex items-center justify-center mx-auto mb-6">
          <span className="text-[--color-gold] text-3xl">✓</span>
        </div>
        <h2 className="font-serif text-3xl font-semibold mb-3">
          Booking <span className="gold-text">Confirmed!</span>
        </h2>
        <p className="text-[--color-on-dark-muted] mb-2">
          Your appointment is confirmed. A confirmation has been sent to your email and phone.
        </p>
        <p className="text-xs text-[--color-on-dark-muted] mb-8">
          Booking ID: <span className="text-[--color-gold] font-mono">{appointmentId?.slice(0, 8).toUpperCase()}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>Book Another Appointment</Button>
          <Button variant="outline" onClick={() => window.location.href = "/appointments"}>
            View My Appointments
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
