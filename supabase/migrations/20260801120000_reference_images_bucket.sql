-- Storage bucket for booking reference images (Pinterest/Instagram screenshots, own photos)
insert into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', true)
on conflict (id) do nothing;

CREATE POLICY "Public read reference images" ON storage.objects FOR SELECT
  USING (bucket_id = 'reference-images');

CREATE POLICY "Users upload own reference images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reference-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own reference images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reference-images' AND (storage.foldername(name))[1] = auth.uid()::text);
