-- Public article pages load covers from /object/public without a session.
-- Keep insert/update/delete admin-only; allow anyone to read the bucket.
drop policy if exists "Public can read article images" on storage.objects;

create policy "Public can read article images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'article-images');
