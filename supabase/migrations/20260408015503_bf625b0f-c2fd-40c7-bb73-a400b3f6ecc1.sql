
-- 1. Make course-content bucket private
UPDATE storage.buckets SET public = false WHERE id = 'course-content';

-- 2. Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public can view course content" ON storage.objects;

-- 3. Add a SELECT policy that requires active subscription or admin role
CREATE POLICY "Subscribers and admins can view course content"
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
  )
);

-- 4. Add tutor INSERT policy for student_tasks
CREATE POLICY "Tutors can insert own student tasks"
ON public.student_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_tasks.student_id
    AND students.tutor_id = auth.uid()
  )
);

-- 5. Add tutor UPDATE policy for student_tasks
CREATE POLICY "Tutors can update own student tasks"
ON public.student_tasks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_tasks.student_id
    AND students.tutor_id = auth.uid()
  )
);

-- 6. Add tutor DELETE policy for student_tasks
CREATE POLICY "Tutors can delete own student tasks"
ON public.student_tasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_tasks.student_id
    AND students.tutor_id = auth.uid()
  )
);
