create extension if not exists "pgcrypto";

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logo_url text null,
  club_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clubs enable row level security;

create unique index if not exists clubs_owner_user_id_key
on public.clubs (owner_user_id);

create policy "clubs_select_own"
on public.clubs
for select
using (owner_user_id = auth.uid());

create policy "clubs_insert_own"
on public.clubs
for insert
with check (owner_user_id = auth.uid());

create policy "clubs_update_own"
on public.clubs
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "clubs_delete_own"
on public.clubs
for delete
using (owner_user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_clubs_updated_at on public.clubs;

create trigger set_clubs_updated_at
before update on public.clubs
for each row execute function public.set_updated_at();
