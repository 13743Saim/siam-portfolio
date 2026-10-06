create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
grant usage on schema public to service_role;
grant select, insert, update on table public.portfolio_content to service_role;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 1 and 254),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;
grant insert, select on table public.contact_submissions to service_role;

create table if not exists public.portfolio_site_views (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null default 'ZZ',
  created_at timestamptz not null default now()
);

alter table public.portfolio_site_views enable row level security;
grant insert, select on table public.portfolio_site_views to service_role;

create table if not exists public.portfolio_site_views (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null default 'ZZ',
  created_at timestamptz not null default now()
);

alter table public.portfolio_site_views enable row level security;
grant insert, select on table public.portfolio_site_views to service_role;

insert into public.portfolio_content (id, content)
values ('main', $portfolio$
{
  "profileImageUrl": "",
  "projects": [
    {"id":"market-opportunity-map","index":"01","title":"Market Opportunity Map","summary":"A practical framework for comparing demand signals, competitor activity, and customer fit across target markets.","tags":["Market Sizing","Customer Signals","Opportunity Mapping"],"visual":"MARKET SIGNALS","kind":"market","imageUrl":"","published":true},
    {"id":"decision-ready-data-analysis","index":"02","title":"Decision-ready Data Analysis","summary":"Turn complex inputs into clear comparisons, surface meaningful patterns, and clarify the next business decision.","tags":["Data Preparation","Analysis","Visualization"],"visual":"DATA PATTERNS","kind":"analysis","imageUrl":"","published":true},
    {"id":"big-data-signal-explorer","index":"03","title":"Big Data Signal Explorer","summary":"A scalable exploration concept for linking large datasets, finding recurring patterns, and presenting useful signals.","tags":["Big Data","Pattern Discovery","Business Insights"],"visual":"CONNECTED SIGNALS","kind":"network","imageUrl":"","published":true},
    {"id":"football-player-analysis","index":"04","title":"Football Player Analysis","summary":"A scouting dashboard concept that brings player attributes, match actions, and positional movement into one analysis view.","tags":["Player Scouting","Performance Analysis","Data Visualization"],"visual":"FOOTBALL ANALYTICS","kind":"football","imageUrl":"","published":true}
  ]
}
$portfolio$::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  4194304,
  array['image/avif', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;