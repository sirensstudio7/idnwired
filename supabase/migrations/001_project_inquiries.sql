-- Project intake submissions (brand / campaign briefs)
create table if not exists public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  targets text,
  launch_date text,
  budget_band text,
  project_details text not null,
  source text not null default 'footer_cta'
);

create index if not exists project_inquiries_created_at_idx
  on public.project_inquiries (created_at desc);

create index if not exists project_inquiries_status_idx
  on public.project_inquiries (status);

alter table public.project_inquiries enable row level security;

-- No policies for anon/authenticated INSERT: public form uses service role via API.
-- Authenticated admins (Supabase Auth) can read and update status/fields.

create policy "Admins can select project_inquiries"
  on public.project_inquiries
  for select
  to authenticated
  using (true);

create policy "Admins can update project_inquiries"
  on public.project_inquiries
  for update
  to authenticated
  using (true)
  with check (true);
