
-- Add teacher_id column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS teacher_id uuid;

-- RLS policies for teachers on students
CREATE POLICY "Teachers can view assigned students"
  ON public.students FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can update assigned students"
  ON public.students FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert students for themselves"
  ON public.students FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid()
  );

-- RLS policies for teachers on student_tasks
CREATE POLICY "Teachers can view assigned student tasks"
  ON public.student_tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_tasks.student_id
        AND students.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert tasks for assigned students"
  ON public.student_tasks FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_tasks.student_id
        AND students.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update tasks for assigned students"
  ON public.student_tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_tasks.student_id
        AND students.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete tasks for assigned students"
  ON public.student_tasks FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_tasks.student_id
        AND students.teacher_id = auth.uid()
    )
  );

-- RLS policies for teachers on student_notes
CREATE POLICY "Teachers can view assigned student notes"
  ON public.student_notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_notes.student_id
        AND students.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert notes for assigned students"
  ON public.student_notes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_notes.student_id
        AND students.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update notes for assigned students"
  ON public.student_notes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_notes.student_id
        AND students.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete notes for assigned students"
  ON public.student_notes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_notes.student_id
        AND students.teacher_id = auth.uid()
    )
  );

-- Allow admins to read all profiles (needed to assign teachers)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
