
-- Create storage bucket for course content
INSERT INTO storage.buckets (id, name, public) VALUES ('course-content', 'course-content', true);

-- Allow admins to upload files
CREATE POLICY "Admins can upload course content" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-content' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update files
CREATE POLICY "Admins can update course content" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'course-content' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete files
CREATE POLICY "Admins can delete course content" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'course-content' AND public.has_role(auth.uid(), 'admin'));

-- Allow public to view course content
CREATE POLICY "Public can view course content" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'course-content');
