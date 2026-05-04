"use client";

import { create } from "zustand";
import type { Style, TimeSlot } from "@/types/database";

export type BookingStep =
  | "style"
  | "customise"
  | "photos"
  | "ai-suggest"
  | "slot"
  | "review"
  | "payment"
  | "confirm";

interface AISuggestion {
  style: string;
  reason: string;
  confidence: number;
  estimatedPacks: number;
  estimatedHours: number;
}

interface BookingCustomisation {
  braidLength: string;
  colour: string;
  thickness: string;
  notes: string;
}

interface BookingState {
  step: BookingStep;
  selectedStyle: Style | null;
  customisation: BookingCustomisation;
  inspirationPhotos: string[];
  aiSuggestions: AISuggestion[];
  selectedSlot: TimeSlot | null;
  appointmentId: string | null;
  paymentIntentClientSecret: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;

  setStep: (step: BookingStep) => void;
  setSelectedStyle: (style: Style | null) => void;
  setCustomisation: (data: Partial<BookingCustomisation>) => void;
  addInspirationPhoto: (url: string) => void;
  removeInspirationPhoto: (url: string) => void;
  setAISuggestions: (suggestions: AISuggestion[]) => void;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  setAppointmentId: (id: string) => void;
  setPaymentIntentClientSecret: (secret: string) => void;
  setIsRecurring: (value: boolean) => void;
  setRecurrenceRule: (rule: string | null) => void;
  reset: () => void;
}

const defaultCustomisation: BookingCustomisation = {
  braidLength: "",
  colour: "",
  thickness: "",
  notes: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  step: "style",
  selectedStyle: null,
  customisation: defaultCustomisation,
  inspirationPhotos: [],
  aiSuggestions: [],
  selectedSlot: null,
  appointmentId: null,
  paymentIntentClientSecret: null,
  isRecurring: false,
  recurrenceRule: null,

  setStep: (step) => set({ step }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setCustomisation: (data) =>
    set((state) => ({ customisation: { ...state.customisation, ...data } })),
  addInspirationPhoto: (url) =>
    set((state) => ({ inspirationPhotos: [...state.inspirationPhotos, url] })),
  removeInspirationPhoto: (url) =>
    set((state) => ({
      inspirationPhotos: state.inspirationPhotos.filter((p) => p !== url),
    })),
  setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setAppointmentId: (id) => set({ appointmentId: id }),
  setPaymentIntentClientSecret: (secret) =>
    set({ paymentIntentClientSecret: secret }),
  setIsRecurring: (value) => set({ isRecurring: value }),
  setRecurrenceRule: (rule) => set({ recurrenceRule: rule }),
  reset: () =>
    set({
      step: "style",
      selectedStyle: null,
      customisation: defaultCustomisation,
      inspirationPhotos: [],
      aiSuggestions: [],
      selectedSlot: null,
      appointmentId: null,
      paymentIntentClientSecret: null,
      isRecurring: false,
      recurrenceRule: null,
    }),
}));
