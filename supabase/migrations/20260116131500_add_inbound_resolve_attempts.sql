alter table public.inbound_targets
  add column if not exists resolve_attempts int not null default 0,
  add column if not exists last_attempt_at timestamptz null;
