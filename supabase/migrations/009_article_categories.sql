-- Desk categories: Regulation, Business, Tech, People.
alter table public.articles
  alter column category set default 'Business';

update public.articles
set category = case category
  when 'Market' then 'Business'
  when 'Media' then 'People'
  when 'Distribution' then 'People'
  when 'SEO' then 'Tech'
  when 'Sectors' then 'Regulation'
  when 'Insights' then 'Business'
  else category
end
where category not in ('Regulation', 'Business', 'Tech', 'People');
