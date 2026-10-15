-- Editorial articles created from the admin dashboard
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published')),
  slug text not null,
  title text not null,
  excerpt text not null default '',
  seo_title text,
  seo_description text,
  category text not null default 'Insights',
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  canonical_url text,
  author_name text not null default 'IDNWIRED editorial',
  author_role text not null default 'Press desk',
  author_avatar_url text,
  body_markdown text not null default '',
  created_by uuid references auth.users (id) on delete set null
);

create unique index if not exists articles_slug_key on public.articles (slug);
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc nulls last);

create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_articles_updated_at();

alter table public.articles enable row level security;

create policy "Anon can select published articles"
  on public.articles
  for select
  to anon
  using (status = 'published');

create policy "Admins can select articles"
  on public.articles
  for select
  to authenticated
  using (true);

create policy "Admins can insert articles"
  on public.articles
  for insert
  to authenticated
  with check (true);

create policy "Admins can update articles"
  on public.articles
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Admins can delete articles"
  on public.articles
  for delete
  to authenticated
  using (true);
