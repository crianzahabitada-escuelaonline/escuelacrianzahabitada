CREATE POLICY "Tutors can delete own students"
ON public.students
FOR DELETE
TO authenticated
USING (auth.uid() = tutor_id);