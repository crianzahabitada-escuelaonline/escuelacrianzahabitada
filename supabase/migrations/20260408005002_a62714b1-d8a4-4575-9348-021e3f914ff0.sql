
-- Course lessons
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text DEFAULT '',
  order_num integer NOT NULL DEFAULT 0,
  duration text DEFAULT '',
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lessons" ON public.course_lessons
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Subscribers can view lessons" ON public.course_lessons
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses WHERE courses.id = course_lessons.course_id AND courses.is_published = true
  ) AND (
    EXISTS (SELECT 1 FROM public.subscriptions WHERE subscriptions.user_id = auth.uid() AND subscriptions.status = 'active')
    OR has_role(auth.uid(), 'admin')
    OR course_lessons.is_free = true
  ));

-- Calendar events
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_type text NOT NULL DEFAULT 'webinar',
  event_date date NOT NULL,
  event_time text DEFAULT '18:00',
  is_public boolean NOT NULL DEFAULT true,
  meeting_url text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Public events visible to everyone (including anonymous)
CREATE POLICY "Public events visible to all" ON public.calendar_events
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

-- Private events visible to subscribers and admins
CREATE POLICY "Private events visible to subscribers" ON public.calendar_events
  FOR SELECT TO authenticated
  USING (is_public = false AND (
    EXISTS (SELECT 1 FROM public.subscriptions WHERE subscriptions.user_id = auth.uid() AND subscriptions.status = 'active')
    OR has_role(auth.uid(), 'admin')
  ));

-- Admins can manage all events
CREATE POLICY "Admins can manage events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Allow public to view published courses (anon)
CREATE POLICY "Published courses visible to public" ON public.courses
  FOR SELECT TO anon
  USING (is_published = true);

-- Allow public to view free lessons
CREATE POLICY "Free lessons visible to public" ON public.course_lessons
  FOR SELECT TO anon
  USING (is_free = true AND EXISTS (
    SELECT 1 FROM public.courses WHERE courses.id = course_lessons.course_id AND courses.is_published = true
  ));
