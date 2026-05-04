export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LoyaltyTier = "none" | "silver" | "gold" | "diamond";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentType = "deposit" | "balance" | "refund";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type NotificationType = "confirmation" | "reminder_48h" | "reminder_12h" | "cancellation" | "feedback";
export type NotificationChannel = "sms" | "email";
export type StyleCategory = "knotless" | "box_braids" | "locs" | "twists" | "cornrows";
export type UserRole = "customer" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      styles: {
        Row: Style;
        Insert: Omit<Style, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Style, "id">>;
        Relationships: [];
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Omit<TimeSlot, "id"> & { id?: string };
        Update: Partial<Omit<TimeSlot, "id">>;
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Appointment, "id">>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Payment, "id">>;
        Relationships: [];
      };
      loyalty_records: {
        Row: LoyaltyRecord;
        Insert: Omit<LoyaltyRecord, "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<Omit<LoyaltyRecord, "id">>;
        Relationships: [];
      };
      referral_conversions: {
        Row: ReferralConversion;
        Insert: Omit<ReferralConversion, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<ReferralConversion, "id">>;
        Relationships: [];
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: Omit<NotificationLog, "id"> & { id?: string };
        Update: Partial<Omit<NotificationLog, "id">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  hair_length: string | null;
  hair_texture: string | null;
  hair_history: string | null;
  role: UserRole;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface Style {
  id: string;
  name: string;
  category: StyleCategory;
  description: string | null;
  images: string[];
  duration_min: number;
  duration_max: number;
  price_min: number;
  price_max: number;
  colour_suggestions: string[];
  is_active: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Appointment {
  id: string;
  user_id: string;
  style_id: string;
  slot_id: string;
  braid_length: string | null;
  colour: string | null;
  thickness: string | null;
  inspiration_photos: string[];
  ai_suggestion: Json | null;
  status: AppointmentStatus;
  is_recurring: boolean;
  recurrence_rule: string | null;
  notes: string | null;
  total_amount: number;
  deposit_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  payment_method: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface LoyaltyRecord {
  id: string;
  user_id: string;
  completed_appointments: number;
  total_spent: number;
  tier: LoyaltyTier;
  points: number;
  updated_at: string;
}

export interface ReferralConversion {
  id: string;
  referrer_id: string;
  referee_id: string;
  appointment_id: string | null;
  reward_applied: boolean;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  appointment_id: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  status: "sent" | "failed";
  sent_at: string;
}

export type AppointmentWithDetails = Appointment & {
  profiles: Profile;
  styles: Style;
  time_slots: TimeSlot;
};
