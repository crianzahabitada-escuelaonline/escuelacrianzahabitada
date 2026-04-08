
-- Tasks/assignments for students
CREATE TABLE public.student_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage tasks" ON public.student_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Tutors can view their students' tasks
CREATE POLICY "Tutors can view own student tasks" ON public.student_tasks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.students WHERE students.id = student_tasks.student_id AND students.tutor_id = auth.uid()
  ));

-- Notes/grades for students
CREATE TABLE public.student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  grade numeric,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes" ON public.student_notes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Tutors can view own student notes" ON public.student_notes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.students WHERE students.id = student_notes.student_id AND students.tutor_id = auth.uid()
  ));
