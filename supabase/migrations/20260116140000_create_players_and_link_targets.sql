create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  sportmonks_player_id bigint not null,
  name text not null,
  current_team text null,
  position text null,
  nationality text null,
  dob date null,
  data jsonb not null default '{}'::jsonb,
  last_fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

create unique index if not exists players_club_sportmonks_unique
on public.players (club_id, sportmonks_player_id);

create policy "players_select_own"
on public.players
for select
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "players_insert_own"
on public.players
for insert
with check (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "players_update_own"
on public.players
for update
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()))
with check (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "players_delete_own"
on public.players
for delete
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

drop trigger if exists set_players_updated_at on public.players;

create trigger set_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

alter table public.inbound_targets
  add column if not exists player_id uuid null references public.players(id) on delete set null,
  add column if not exists fetch_attempts int not null default 0,
  add column if not exists last_fetch_attempt_at timestamptz null;
