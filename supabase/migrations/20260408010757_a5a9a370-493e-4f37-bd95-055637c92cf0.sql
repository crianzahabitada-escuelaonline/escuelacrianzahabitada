
CREATE TABLE public.digital_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  author text DEFAULT 'Paola Patricelli',
  price numeric NOT NULL DEFAULT 0,
  product_type text NOT NULL DEFAULT 'guia',
  cover_url text DEFAULT '',
  file_url text DEFAULT '',
  pages_info text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

-- Everyone can see published products
CREATE POLICY "Published products visible to all" ON public.digital_products
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage products" ON public.digital_products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
