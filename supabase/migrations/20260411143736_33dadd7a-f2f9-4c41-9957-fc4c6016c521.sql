
-- 1. Remove the public read policy from course-content storage bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'course-content';

-- 2. Add INSERT policy for product_purchases so users can only insert their own
CREATE POLICY "Users can insert own product purchases"
ON public.product_purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Restrict has_role() to only allow checking own role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (_user_id = auth.uid() OR auth.uid() IN (SELECT ur.user_id FROM public.user_roles ur WHERE ur.role = 'admin'))
  )
$$;
