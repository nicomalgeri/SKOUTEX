alter table public.clubs
  add column if not exists transfer_filters jsonb null;
