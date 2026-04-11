
-- Drop and recreate the storage SELECT policy to include course purchasers
DROP POLICY IF EXISTS "Subscribers and admins can view course content" ON storage.objects;

CREATE POLICY "Authorized users can view course content"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-content'
  AND (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.user_id = auth.uid()
      AND subscriptions.status = 'active'
    )
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.course_purchases
      WHERE course_purchases.user_id = auth.uid()
      AND course_purchases.status = 'approved'
    )
  )
);
