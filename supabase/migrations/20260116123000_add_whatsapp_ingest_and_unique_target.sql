alter table public.clubs
  add column if not exists whatsapp_ingest_enabled boolean not null default false;

with ranked as (
  select
    id,
    row_number() over (
      partition by club_id, source_url
      order by created_at desc
    ) as rn
  from public.inbound_targets
  where status in ('RECEIVED', 'RESOLVING', 'NEEDS_CONFIRMATION', 'READY_FOR_FETCH')
)
delete from public.inbound_targets t
using ranked r
where t.id = r.id
  and r.rn > 1;

create unique index if not exists inbound_targets_unique_active
  on public.inbound_targets (club_id, source_url)
  where status in ('RECEIVED', 'RESOLVING', 'NEEDS_CONFIRMATION', 'READY_FOR_FETCH');
