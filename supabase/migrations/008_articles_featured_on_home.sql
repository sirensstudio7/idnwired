-- Highlight flag: published articles can appear in the homepage news carousel.
alter table public.articles
  add column if not exists featured_on_home boolean not null default false;

comment on column public.articles.featured_on_home is
  'When true, a published article is shown in the homepage / landing news carousel.';

create index if not exists articles_featured_on_home_idx
  on public.articles (published_at desc nulls last)
  where status = 'published' and featured_on_home;

-- Keep the current homepage set visible after this ships.
update public.articles
set featured_on_home = true
where status = 'published';
