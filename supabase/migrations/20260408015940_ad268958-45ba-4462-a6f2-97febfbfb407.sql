
-- CRITICAL: Prevent privilege escalation on user_roles
-- Only admins can INSERT roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can UPDATE roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tutor policies for student_notes
CREATE POLICY "Tutors can insert own student notes"
ON public.student_notes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_notes.student_id
    AND students.tutor_id = auth.uid()
  )
);

CREATE POLICY "Tutors can update own student notes"
ON public.student_notes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_notes.student_id
    AND students.tutor_id = auth.uid()
  )
);

CREATE POLICY "Tutors can delete own student notes"
ON public.student_notes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_notes.student_id
    AND students.tutor_id = auth.uid()
  )
);
