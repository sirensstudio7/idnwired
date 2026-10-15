-- Allows the public form API to insert using the anon key when service role is not configured.
-- Reads/updates remain limited to authenticated admins.

grant insert on public.project_inquiries to anon;

create policy "Public can insert project inquiries"
  on public.project_inquiries
  for insert
  to anon
  with check (true);
