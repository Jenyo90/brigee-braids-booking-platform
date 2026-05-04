-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  facebook TEXT,
  instagram TEXT,
  tiktok TEXT,
  hair_length TEXT,
  hair_texture TEXT,
  hair_history TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Style catalogue
CREATE TABLE public.styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('knotless', 'box_braids', 'locs', 'twists', 'cornrows')),
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  duration_min INT NOT NULL,
  duration_max INT NOT NULL,
  price_min DECIMAL(10,2) NOT NULL,
  price_max DECIMAL(10,2) NOT NULL,
  colour_suggestions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOL NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin-controlled time slots
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOL NOT NULL DEFAULT true,
  UNIQUE (date, start_time)
);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES public.styles(id),
  slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  braid_length TEXT,
  colour TEXT,
  thickness TEXT,
  inspiration_photos TEXT[] NOT NULL DEFAULT '{}',
  ai_suggestion JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_recurring BOOL NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lock slot when appointment is pending/confirmed
CREATE INDEX idx_appointments_slot ON public.appointments(slot_id, status);
CREATE INDEX idx_appointments_user ON public.appointments(user_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_time_slots_date ON public.time_slots(date, is_available);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'aud',
  type TEXT NOT NULL CHECK (type IN ('deposit', 'balance', 'refund')),
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_appointment ON public.payments(appointment_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);

-- Loyalty records (one per user)
CREATE TABLE public.loyalty_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_appointments INT NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'none' CHECK (tier IN ('none', 'silver', 'gold', 'diamond')),
  points INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral conversions
CREATE TABLE public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referee_id UUID NOT NULL REFERENCES public.profiles(id),
  appointment_id UUID REFERENCES public.appointments(id),
  reward_applied BOOL NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification logs
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder_48h', 'reminder_12h', 'cancellation', 'feedback')),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_appointment ON public.notification_logs(appointment_id, type);
