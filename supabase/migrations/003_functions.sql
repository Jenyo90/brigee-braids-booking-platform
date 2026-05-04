-- Auto-create profile + loyalty_record on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := upper(substr(md5(random()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code);
  END LOOP;

  INSERT INTO public.profiles (id, email, full_name, role, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    new_referral_code
  );

  INSERT INTO public.loyalty_records (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update loyalty tier and record when appointment is completed
CREATE OR REPLACE FUNCTION public.handle_appointment_completed()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_completed INT;
  new_total DECIMAL(10,2);
  new_tier TEXT;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.loyalty_records
    SET
      completed_appointments = completed_appointments + 1,
      total_spent = total_spent + NEW.total_amount,
      updated_at = NOW()
    WHERE user_id = NEW.user_id
    RETURNING completed_appointments, total_spent
    INTO new_completed, new_total;

    -- Update tier
    IF new_completed >= 20 THEN
      new_tier := 'diamond';
    ELSIF new_completed >= 10 THEN
      new_tier := 'gold';
    ELSIF new_completed >= 5 THEN
      new_tier := 'silver';
    ELSE
      new_tier := 'none';
    END IF;

    UPDATE public.loyalty_records
    SET tier = new_tier
    WHERE user_id = NEW.user_id;

    -- Mark time slot as available again if appointment cancelled
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_appointment_completed
  AFTER UPDATE OF status ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_appointment_completed();

-- Release time slot when appointment is cancelled
CREATE OR REPLACE FUNCTION public.handle_appointment_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.time_slots
    SET is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_appointment_cancelled
  AFTER UPDATE OF status ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_appointment_cancelled();

-- Lock time slot when appointment is created
CREATE OR REPLACE FUNCTION public.handle_appointment_created()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.time_slots
  SET is_available = false
  WHERE id = NEW.slot_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_appointment_created
  AFTER INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_appointment_created();

-- Seed styles data
INSERT INTO public.styles (name, category, description, duration_min, duration_max, price_min, price_max, colour_suggestions, images) VALUES
  ('Knotless Box Braids', 'knotless', 'Tension-free knotless braids starting from the root. Lightweight and natural-looking.', 240, 480, 200, 450, ARRAY['#1B', '1B/30', '1B/27', 'Burgundy', 'Goddess Brown'], ARRAY[]::TEXT[]),
  ('Classic Box Braids', 'box_braids', 'Traditional box braids with clean parts. Versatile and long-lasting.', 180, 360, 150, 350, ARRAY['#1', '#1B', '1B/30', '1B/27', 'Honey Blonde'], ARRAY[]::TEXT[]),
  ('Faux Locs', 'locs', 'Bohemian faux locs with a natural, earthy feel. Distressed or smooth finish available.', 300, 480, 250, 400, ARRAY['#1B', 'Medium Brown', 'Burgundy', 'Russet Brown'], ARRAY[]::TEXT[]),
  ('Senegalese Twists', 'twists', 'Sleek rope twists using Kanekalon or Marley hair. Elegant and protective.', 180, 300, 150, 300, ARRAY['#1B', '1B/30', 'Dark Brown', 'Chocolate'], ARRAY[]::TEXT[]),
  ('Ghana Cornrows', 'cornrows', 'Intricate feed-in cornrow patterns. Scalp-friendly and stylish.', 90, 180, 80, 200, ARRAY['#1', '#1B', 'Natural'], ARRAY[]::TEXT[]),
  ('Butterfly Locs', 'locs', 'Textured, soft locs with a distressed wrap technique. Trendy and bohemian.', 300, 420, 280, 420, ARRAY['#1B', 'Medium Brown', '1B/30'], ARRAY[]::TEXT[]),
  ('Boho Knotless Braids', 'knotless', 'Knotless braids with curly ends for a carefree, bohemian look.', 300, 480, 230, 480, ARRAY['1B/30', '1B/27', 'Goddess Brown', 'Auburn'], ARRAY[]::TEXT[]),
  ('Jumbo Box Braids', 'box_braids', 'Large, statement box braids. Quick install with a bold aesthetic.', 120, 240, 120, 250, ARRAY['#1', '#1B', '1B/30', 'Burgundy'], ARRAY[]::TEXT[]);

-- Seed time slots (next 30 days, Mon–Sat, 9am–5pm with 2 slots per day)
INSERT INTO public.time_slots (date, start_time, end_time, is_available)
SELECT
  d::DATE,
  '09:00',
  '14:00',
  true
FROM generate_series(
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '32 days',
  INTERVAL '1 day'
) AS d
WHERE EXTRACT(DOW FROM d) BETWEEN 1 AND 6;

INSERT INTO public.time_slots (date, start_time, end_time, is_available)
SELECT
  d::DATE,
  '14:00',
  '19:00',
  true
FROM generate_series(
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '32 days',
  INTERVAL '1 day'
) AS d
WHERE EXTRACT(DOW FROM d) BETWEEN 1 AND 6;
