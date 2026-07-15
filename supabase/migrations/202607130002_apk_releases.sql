insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'releases',
  'releases',
  true,
  250 * 1024 * 1024,
  array['application/vnd.android.package-archive']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public downloads DuoBiblia releases" on storage.objects;
create policy "public downloads DuoBiblia releases"
on storage.objects for select
using (bucket_id = 'releases');

