-- Supabase Storage setup for Lingora (run once in the Supabase SQL editor).
--
-- Uploads are authorised by the Spring Boot backend: it checks the user (JWT), the file kind,
-- size and folder (admins: content/**, learners: avatars/{userId}) and returns a one-time
-- signed upload URL created with the service key (SUPABASE_SERVICE_KEY, server-side only).
-- The browser never holds a Supabase credential, so no write policies are needed on
-- storage.objects; reads go through the public CDN URL of the bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 209715200,
  array['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml',
        'audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/webm','audio/mp4','audio/aac','audio/x-m4a',
        'video/mp4','video/webm','video/ogg','video/quicktime']
)
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Remove the policies of the former Firebase-token setup, if they were installed.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'lingora %'
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;
drop function if exists public.is_lingora_admin();
drop function if exists public.is_lingora_firebase_user();
