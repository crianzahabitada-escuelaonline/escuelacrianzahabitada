
UPDATE storage.buckets SET public = true WHERE id = 'course-content';

-- Allow anyone to view files (for covers/videos)
CREATE POLICY "Public read access" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'course-content');

-- Only admins can upload/update/delete
CREATE POLICY "Admins can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-content' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'course-content' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-content' AND public.has_role(auth.uid(), 'admin'));
