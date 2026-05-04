-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOL
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- styles: public read, admin write
CREATE POLICY "styles_select_public" ON public.styles
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "styles_insert_admin" ON public.styles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "styles_update_admin" ON public.styles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "styles_delete_admin" ON public.styles
  FOR DELETE USING (public.is_admin());

-- time_slots: public read, admin write
CREATE POLICY "slots_select_public" ON public.time_slots
  FOR SELECT USING (true);

CREATE POLICY "slots_insert_admin" ON public.time_slots
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "slots_update_admin" ON public.time_slots
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "slots_delete_admin" ON public.time_slots
  FOR DELETE USING (public.is_admin());

-- appointments
CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "appointments_insert_own" ON public.appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "appointments_update_own" ON public.appointments
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "appointments_delete_admin" ON public.appointments
  FOR DELETE USING (public.is_admin());

-- payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE USING (public.is_admin());

-- loyalty_records
CREATE POLICY "loyalty_select_own" ON public.loyalty_records
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "loyalty_insert_system" ON public.loyalty_records
  FOR INSERT WITH CHECK (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "loyalty_update_system" ON public.loyalty_records
  FOR UPDATE USING (public.is_admin());

-- referral_conversions
CREATE POLICY "referral_select_own" ON public.referral_conversions
  FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid() OR public.is_admin());

CREATE POLICY "referral_insert_system" ON public.referral_conversions
  FOR INSERT WITH CHECK (public.is_admin() OR referee_id = auth.uid());

CREATE POLICY "referral_update_admin" ON public.referral_conversions
  FOR UPDATE USING (public.is_admin());

-- notification_logs: admin only
CREATE POLICY "notifications_admin" ON public.notification_logs
  FOR ALL USING (public.is_admin());
