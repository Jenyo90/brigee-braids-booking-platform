import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAUD(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function formatAUDFromDollars(dollars: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(dollars);
}

export function calculateDeposit(total: number, percentage = 10): number {
  return Math.round((total * percentage) / 100 * 100) / 100;
}

export function generateReferralCode(): string {
  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
  return nanoid();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Sydney",
  }).format(date);
}

export function getLoyaltyTier(completedAppointments: number): "none" | "silver" | "gold" | "diamond" {
  if (completedAppointments >= 20) return "diamond";
  if (completedAppointments >= 10) return "gold";
  if (completedAppointments >= 5) return "silver";
  return "none";
}

export function getLoyaltyProgress(completedAppointments: number): { current: number; next: number; label: string } {
  if (completedAppointments < 5) return { current: completedAppointments, next: 5, label: "Silver" };
  if (completedAppointments < 10) return { current: completedAppointments - 5, next: 5, label: "Gold" };
  if (completedAppointments < 20) return { current: completedAppointments - 10, next: 10, label: "Diamond" };
  return { current: 20, next: 20, label: "Diamond" };
}
