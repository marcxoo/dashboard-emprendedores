-- Catalog of event responsibles for EventDashboard
create table if not exists public.event_responsibles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_responsibles_active
  on public.event_responsibles (active);

alter table public.event_responsibles enable row level security;

drop policy if exists "Public can read event responsibles" on public.event_responsibles;
create policy "Public can read event responsibles"
  on public.event_responsibles
  for select
  using (true);

drop policy if exists "Public can insert event responsibles" on public.event_responsibles;
create policy "Public can insert event responsibles"
  on public.event_responsibles
  for insert
  with check (true);

drop policy if exists "Public can update event responsibles" on public.event_responsibles;
create policy "Public can update event responsibles"
  on public.event_responsibles
  for update
  using (true)
  with check (true);

insert into public.event_responsibles (name)
values
  ('ANGIE HOLGUÍN'),
  ('CARLOS RODRÍGUEZ'),
  ('XUXA CEDEÑO'),
  ('MARCOS LOJA'),
  ('JAEL ZAMBRANO M')
on conflict (name) do nothing;
