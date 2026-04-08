
-- Add price column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 10;

-- Create course_purchases table
CREATE TABLE IF NOT EXISTS public.course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  mp_payment_id text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view own purchases
CREATE POLICY "Users can view own course purchases" ON public.course_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage course purchases" ON public.course_purchases
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow edge function inserts (service role)
CREATE POLICY "Service can insert course purchases" ON public.course_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
