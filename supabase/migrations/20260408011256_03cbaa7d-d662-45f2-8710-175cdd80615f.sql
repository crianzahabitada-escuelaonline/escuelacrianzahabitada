
CREATE TABLE public.product_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  mp_payment_id text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.product_purchases
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage purchases" ON public.product_purchases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
