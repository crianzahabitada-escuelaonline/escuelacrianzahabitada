
-- Community groups table
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  age_range TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups visible to all authenticated" ON public.community_groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Groups visible to anon" ON public.community_groups
  FOR SELECT TO anon USING (true);

CREATE POLICY "Admins can manage groups" ON public.community_groups
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed the 6 fixed groups
INSERT INTO public.community_groups (slug, label, emoji, description, age_range, display_order) VALUES
  ('preescolar', 'Preescolar', '🌱', 'Familias con niños de 3 a 5 años', '3-5 años', 1),
  ('primaria-baja', 'Primaria Baja', '🌿', 'Familias con niños de 6 a 8 años (1° a 3° grado)', '6-8 años', 2),
  ('primaria-alta', 'Primaria Alta', '🌳', 'Familias con niños de 9 a 11 años (4° a 6° grado)', '9-11 años', 3),
  ('secundaria', 'Secundaria', '🍃', 'Familias con adolescentes de 12 a 15 años', '12-15 años', 4),
  ('padres', 'Solo Padres', '💛', 'Espacio exclusivo para madres y padres', NULL, 5),
  ('educadores', 'Educadores', '📚', 'Comunidad de docentes y facilitadores', NULL, 6);

-- Group members (users: teachers and parents/tutors)
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own memberships" ON public.group_members
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Student groups
CREATE TABLE public.student_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (group_id, student_id)
);

ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage student groups" ON public.student_groups
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view student groups for assigned students" ON public.student_groups
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_groups.student_id
      AND students.teacher_id = auth.uid()
  ));

CREATE POLICY "Tutors can view own student groups" ON public.student_groups
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = student_groups.student_id
      AND students.tutor_id = auth.uid()
  ));

-- Group content (videos and digital products per group)
CREATE TABLE public.group_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'video',
  file_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.group_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage group content" ON public.group_content
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Group members can view published content" ON public.group_content
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND (
      EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = group_content.group_id
          AND group_members.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.student_groups sg
        JOIN public.students s ON s.id = sg.student_id
        WHERE sg.group_id = group_content.group_id
          AND (s.tutor_id = auth.uid() OR s.teacher_id = auth.uid())
      )
    )
  );
