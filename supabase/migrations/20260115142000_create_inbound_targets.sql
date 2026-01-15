create table if not exists public.inbound_messages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  from_phone text null,
  raw_text text not null,
  transfermarkt_url text null,
  received_at timestamptz not null default now()
);

create table if not exists public.inbound_targets (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  source text not null default 'whatsapp_transfermarkt',
  source_url text not null,
  status text not null default 'RECEIVED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inbound_messages enable row level security;
alter table public.inbound_targets enable row level security;

create policy "inbound_messages_select_own"
on public.inbound_messages
for select
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_messages_insert_own"
on public.inbound_messages
for insert
with check (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_messages_update_own"
on public.inbound_messages
for update
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()))
with check (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_messages_delete_own"
on public.inbound_messages
for delete
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_targets_select_own"
on public.inbound_targets
for select
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_targets_insert_own"
on public.inbound_targets
for insert
with check (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_targets_update_own"
on public.inbound_targets
for update
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()))
with check (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

create policy "inbound_targets_delete_own"
on public.inbound_targets
for delete
using (club_id in (select id from public.clubs where owner_user_id = auth.uid()));

drop trigger if exists set_inbound_targets_updated_at on public.inbound_targets;

create trigger set_inbound_targets_updated_at
before update on public.inbound_targets
for each row execute function public.set_updated_at();
