alter table public.inbound_targets
  add column if not exists sportmonks_player_id bigint null,
  add column if not exists player_name text null,
  add column if not exists resolution_candidates jsonb null,
  add column if not exists last_error text null;

alter table public.inbound_messages
  add column if not exists reply_to_target_id uuid null references public.inbound_targets(id) on delete set null,
  add column if not exists parsed_reply text null;
