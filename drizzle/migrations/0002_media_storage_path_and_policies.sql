alter table public.media_items add column storage_path text;

-- Visitors of the universe can view (sign links for) files in the souvenirs bucket; only the owner can change them.
create policy "Visitors view souvenirs files" on storage.objects
  for select to anon, authenticated using (bucket_id = 'souvenirs');
create policy "Owner uploads souvenirs files" on storage.objects
  for insert to authenticated with check (bucket_id = 'souvenirs' and public.has_role(auth.uid(), 'admin'));
create policy "Owner updates souvenirs files" on storage.objects
  for update to authenticated using (bucket_id = 'souvenirs' and public.has_role(auth.uid(), 'admin'));
create policy "Owner deletes souvenirs files" on storage.objects
  for delete to authenticated using (bucket_id = 'souvenirs' and public.has_role(auth.uid(), 'admin'));
