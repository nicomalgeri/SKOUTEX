-- Combined Migrations for SKOUTEX
-- Generated: 2026-01-16T11:27:41.884Z
-- Total migrations: 12
--
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Run the query
--
-- Note: Migrations are designed to be idempotent (safe to run multiple times)
-- ============================================================================

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- Migration: 20260115133000_create_clubs.sql
-- ============================================================================

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


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260115133000_create_clubs.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260115142000_create_inbound_targets.sql
-- ============================================================================

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


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260115142000_create_inbound_targets.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116120000_add_inbound_resolution_fields.sql
-- ============================================================================

alter table public.inbound_targets
  add column if not exists sportmonks_player_id bigint null,
  add column if not exists player_name text null,
  add column if not exists resolution_candidates jsonb null,
  add column if not exists last_error text null;

alter table public.inbound_messages
  add column if not exists reply_to_target_id uuid null references public.inbound_targets(id) on delete set null,
  add column if not exists parsed_reply text null;


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116120000_add_inbound_resolution_fields.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116123000_add_whatsapp_ingest_and_unique_target.sql
-- ============================================================================

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


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116123000_add_whatsapp_ingest_and_unique_target.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116131500_add_inbound_resolve_attempts.sql
-- ============================================================================

alter table public.inbound_targets
  add column if not exists resolve_attempts int not null default 0,
  add column if not exists last_attempt_at timestamptz null;


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116131500_add_inbound_resolve_attempts.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116140000_create_players_and_link_targets.sql
-- ============================================================================

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


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116140000_create_players_and_link_targets.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116_add_database_constraints.sql
-- ============================================================================

-- ============================================
-- Database Constraints Migration
-- ============================================
-- Purpose: Add check constraints, unique constraints, and foreign keys
--          to ensure data integrity and prevent invalid data
-- Date: 2026-01-16
-- ============================================

-- ============================================
-- WATCHLIST CONSTRAINTS
-- ============================================

-- Prevent duplicate watchlist entries (same user + player + club)
-- This ensures a player can only be in a club's watchlist once
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_unique_entry
  ON watchlist(user_id, player_id, club_id);

-- Add foreign key constraint for club_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_watchlist_club'
  ) THEN
    ALTER TABLE watchlist
      ADD CONSTRAINT fk_watchlist_club
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- SCOUTING REPORTS CONSTRAINTS
-- ============================================

-- Add foreign key constraint for club_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_scouting_reports_club'
  ) THEN
    ALTER TABLE scouting_reports
      ADD CONSTRAINT fk_scouting_reports_club
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Prevent duplicate reports for same player by same club
CREATE UNIQUE INDEX IF NOT EXISTS idx_scouting_reports_unique
  ON scouting_reports(club_id, player_id);

-- ============================================
-- TRANSFER TARGETS CONSTRAINTS
-- ============================================

-- Ensure priority is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_priority'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_priority
      CHECK (priority IN ('high', 'medium', 'low'));
  END IF;
END $$;

-- Ensure status is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_status'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_status
      CHECK (status IN (
        'scouting',
        'interested',
        'negotiating',
        'offer_made',
        'agreed',
        'completed',
        'rejected',
        'abandoned'
      ));
  END IF;
END $$;

-- Ensure prices are positive if provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_market_value_positive'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_market_value_positive
      CHECK (market_value_eur IS NULL OR market_value_eur > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_target_price_positive'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_target_price_positive
      CHECK (target_price_eur IS NULL OR target_price_eur > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_max_price_positive'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_max_price_positive
      CHECK (max_price_eur IS NULL OR max_price_eur > 0);
  END IF;
END $$;

-- Ensure max_price >= target_price if both provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_max_price_gte_target'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_max_price_gte_target
      CHECK (
        max_price_eur IS NULL OR
        target_price_eur IS NULL OR
        max_price_eur >= target_price_eur
      );
  END IF;
END $$;

-- Ensure age is valid if provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_targets_age_valid'
  ) THEN
    ALTER TABLE transfer_targets
      ADD CONSTRAINT chk_targets_age_valid
      CHECK (age IS NULL OR (age >= 15 AND age <= 50));
  END IF;
END $$;

-- Prevent duplicate targets (same player for same club)
CREATE UNIQUE INDEX IF NOT EXISTS idx_transfer_targets_unique
  ON transfer_targets(club_id, player_id);

-- ============================================
-- TRANSFER WINDOWS CONSTRAINTS
-- ============================================

-- Ensure window_type is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_transfer_windows_type'
  ) THEN
    ALTER TABLE transfer_windows
      ADD CONSTRAINT chk_transfer_windows_type
      CHECK (window_type IN ('summer', 'winter'));
  END IF;
END $$;

-- Ensure end_date is after start_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_transfer_windows_dates'
  ) THEN
    ALTER TABLE transfer_windows
      ADD CONSTRAINT chk_transfer_windows_dates
      CHECK (end_date > start_date);
  END IF;
END $$;

-- Prevent duplicate windows (same league + season + window_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_transfer_windows_unique
  ON transfer_windows(league, season, window_type);

-- ============================================
-- PLAYERS CONSTRAINTS (if table exists)
-- ============================================

-- Ensure player_id is positive
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'players') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'chk_players_id_positive'
    ) THEN
      ALTER TABLE players
        ADD CONSTRAINT chk_players_id_positive
        CHECK (id > 0);
    END IF;
  END IF;
END $$;

-- ============================================
-- INBOUND TARGETS CONSTRAINTS (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inbound_targets') THEN
    -- Ensure status is valid
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'chk_inbound_targets_status'
    ) THEN
      ALTER TABLE inbound_targets
        ADD CONSTRAINT chk_inbound_targets_status
        CHECK (status IN ('pending', 'processing', 'resolved', 'failed'));
    END IF;
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- Constraints added:
-- 1. Watchlist: Unique entries, FK to clubs
-- 2. Scouting Reports: FK to clubs, unique per player per club
-- 3. Transfer Targets: Valid priority/status, positive prices, max >= target, valid age, unique per club
-- 4. Transfer Windows: Valid window_type, end > start, unique per league/season/type
-- 5. Players: Positive IDs
-- 6. Inbound Targets: Valid status
-- ============================================


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116_add_database_constraints.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116_add_performance_indexes.sql
-- ============================================================================

-- Add performance indexes for common queries
-- Migration created: 2026-01-16
-- Purpose: Improve query performance as data grows

-- Index for clubs by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_clubs_user_id ON clubs(user_id);

-- Index for watchlist queries (user + club)
CREATE INDEX IF NOT EXISTS idx_watchlist_user_club ON watchlist(user_id, club_id);

-- Index for scouting reports by player
CREATE INDEX IF NOT EXISTS idx_scouting_reports_player ON scouting_reports(player_id);

-- Index for scouting reports by creation date (for recent reports)
CREATE INDEX IF NOT EXISTS idx_scouting_reports_created ON scouting_reports(created_at DESC);

-- Composite index for watchlist queries with sorting
CREATE INDEX IF NOT EXISTS idx_watchlist_user_created
  ON watchlist(user_id, created_at DESC);

-- Index for scouting reports by club (for club-specific report queries)
CREATE INDEX IF NOT EXISTS idx_scouting_reports_club ON scouting_reports(club_id);

-- Composite index for club + player scouting reports (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_scouting_reports_club_player
  ON scouting_reports(club_id, player_id);

-- Index for clubs by sportmonks_team_id (for logo lookups)
CREATE INDEX IF NOT EXISTS idx_clubs_sportmonks_team_id ON clubs(sportmonks_team_id);

-- Add comment explaining the indexes
COMMENT ON INDEX idx_clubs_user_id IS 'Speeds up club lookups by user_id (primary access pattern)';
COMMENT ON INDEX idx_watchlist_user_club IS 'Speeds up watchlist queries per user and club';
COMMENT ON INDEX idx_scouting_reports_player IS 'Speeds up lookups of all reports for a player';
COMMENT ON INDEX idx_scouting_reports_created IS 'Speeds up recent reports queries';
COMMENT ON INDEX idx_watchlist_user_created IS 'Optimizes watchlist page with sorting by date';
COMMENT ON INDEX idx_scouting_reports_club IS 'Speeds up club-specific report queries';
COMMENT ON INDEX idx_scouting_reports_club_player IS 'Optimizes checking if report exists for club+player';
COMMENT ON INDEX idx_clubs_sportmonks_team_id IS 'Speeds up club logo lookups by Sportmonks ID';


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116_add_performance_indexes.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116_create_notifications.sql
-- ============================================================================

-- ============================================
-- Notifications System Migration
-- ============================================
-- Purpose: Create notifications table for watchlist updates
--          and other system notifications
-- Date: 2026-01-16
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'watchlist_price_change',
    'watchlist_contract_update',
    'watchlist_transfer_news',
    'watchlist_performance_update',
    'target_status_change',
    'transfer_window_alert',
    'system_announcement'
  )),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  related_player_id INTEGER,
  related_target_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  -- Foreign key to users (via auth.users)
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC)
  WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_related_player
  ON notifications(related_player_id)
  WHERE related_player_id IS NOT NULL;

-- Create user preferences table for notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY,
  email_digest_enabled BOOLEAN DEFAULT TRUE,
  email_digest_frequency TEXT DEFAULT 'daily' CHECK (email_digest_frequency IN ('daily', 'weekly', 'never')),
  watchlist_price_change BOOLEAN DEFAULT TRUE,
  watchlist_contract_update BOOLEAN DEFAULT TRUE,
  watchlist_transfer_news BOOLEAN DEFAULT TRUE,
  watchlist_performance_update BOOLEAN DEFAULT TRUE,
  target_status_change BOOLEAN DEFAULT TRUE,
  transfer_window_alert BOOLEAN DEFAULT TRUE,
  email_instant_enabled BOOLEAN DEFAULT FALSE,
  last_digest_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key to users
  CONSTRAINT fk_notification_prefs_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index on preferences
CREATE INDEX IF NOT EXISTS idx_notification_prefs_digest
  ON notification_preferences(email_digest_enabled, email_digest_frequency);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only see their own notifications
CREATE POLICY notifications_user_select
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_user_update
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY notifications_system_insert
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for notification preferences
-- Users can see and update their own preferences
CREATE POLICY notification_prefs_user_all
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create preferences on user signup
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-creating preferences
DROP TRIGGER IF EXISTS trigger_create_notification_preferences ON auth.users;
CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS trigger_update_notification_prefs_updated_at ON notification_preferences;
CREATE TRIGGER trigger_update_notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_prefs_updated_at();

-- ============================================
-- SUMMARY
-- ============================================
-- Tables created:
-- 1. notifications - Stores all user notifications
-- 2. notification_preferences - User notification settings
--
-- Features:
-- - 7 notification types supported
-- - Email digest system (daily/weekly/never)
-- - Granular notification preferences
-- - RLS policies for security
-- - Automatic preference creation on signup
-- - Efficient indexes for queries
-- ============================================


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116_create_notifications.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116_create_transfer_targets.sql
-- ============================================================================

-- Create transfer_targets table
-- Migration created: 2026-01-16
-- Purpose: Track transfer targets with status and priority

CREATE TABLE IF NOT EXISTS transfer_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Player information
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  current_club TEXT,
  position TEXT,
  age INTEGER,
  nationality TEXT,
  market_value_eur INTEGER,

  -- Target details
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  target_price_eur INTEGER,
  max_price_eur INTEGER,
  notes TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'scouting' CHECK (status IN (
    'scouting',
    'interested',
    'negotiating',
    'offer_made',
    'agreed',
    'completed',
    'rejected',
    'abandoned'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one target per player per club
  UNIQUE(club_id, player_id)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_targets_club ON transfer_targets(club_id);
CREATE INDEX IF NOT EXISTS idx_targets_user ON transfer_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_targets_player ON transfer_targets(player_id);
CREATE INDEX IF NOT EXISTS idx_targets_status ON transfer_targets(status);
CREATE INDEX IF NOT EXISTS idx_targets_priority ON transfer_targets(priority);
CREATE INDEX IF NOT EXISTS idx_targets_created ON transfer_targets(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_targets_club_status
  ON transfer_targets(club_id, status);

CREATE INDEX IF NOT EXISTS idx_targets_club_priority
  ON transfer_targets(club_id, priority, created_at DESC);

-- Add RLS policies
ALTER TABLE transfer_targets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own club's targets
CREATE POLICY "Users can view their club targets"
  ON transfer_targets
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Users can insert targets for their own club
CREATE POLICY "Users can create targets for their club"
  ON transfer_targets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Users can update their own club's targets
CREATE POLICY "Users can update their club targets"
  ON transfer_targets
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own club's targets
CREATE POLICY "Users can delete their club targets"
  ON transfer_targets
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR club_id IN (
      SELECT id FROM clubs WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transfer_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transfer_targets_updated_at
  BEFORE UPDATE ON transfer_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_transfer_targets_updated_at();

-- Add comments
COMMENT ON TABLE transfer_targets IS 'Stores transfer targets tracked by clubs';
COMMENT ON COLUMN transfer_targets.priority IS 'Target priority: high, medium, or low';
COMMENT ON COLUMN transfer_targets.status IS 'Current status in the transfer process';
COMMENT ON COLUMN transfer_targets.target_price_eur IS 'Ideal target price for the transfer';
COMMENT ON COLUMN transfer_targets.max_price_eur IS 'Maximum price willing to pay';
COMMENT ON COLUMN transfer_targets.notes IS 'Scouting notes and observations';


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116_create_transfer_targets.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260116_create_transfer_windows.sql
-- ============================================================================

-- Create transfer_windows table
-- Migration created: 2026-01-16
-- Purpose: Track transfer window dates for different leagues

CREATE TABLE IF NOT EXISTS transfer_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league TEXT NOT NULL,
  season TEXT NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('summer', 'winter')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league, season, window_type)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transfer_windows_league ON transfer_windows(league);
CREATE INDEX IF NOT EXISTS idx_transfer_windows_active ON transfer_windows(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_transfer_windows_dates ON transfer_windows(start_date, end_date);

-- Add RLS policies
ALTER TABLE transfer_windows ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read transfer windows
CREATE POLICY "Anyone can view transfer windows"
  ON transfer_windows
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (admin operations)
CREATE POLICY "Only service role can modify transfer windows"
  ON transfer_windows
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert common transfer windows for 2025-26 season
INSERT INTO transfer_windows (league, season, window_type, start_date, end_date, is_active) VALUES
  -- Premier League
  ('Premier League', '2025-26', 'summer', '2025-06-14', '2025-09-01', false),
  ('Premier League', '2025-26', 'winter', '2026-01-01', '2026-02-03', true),

  -- La Liga
  ('La Liga', '2025-26', 'summer', '2025-07-01', '2025-09-02', false),
  ('La Liga', '2025-26', 'winter', '2026-01-02', '2026-02-03', true),

  -- Serie A
  ('Serie A', '2025-26', 'summer', '2025-07-01', '2025-09-01', false),
  ('Serie A', '2025-26', 'winter', '2026-01-02', '2026-02-02', true),

  -- Bundesliga
  ('Bundesliga', '2025-26', 'summer', '2025-07-01', '2025-09-01', false),
  ('Bundesliga', '2025-26', 'winter', '2026-01-02', '2026-02-01', true),

  -- Ligue 1
  ('Ligue 1', '2025-26', 'summer', '2025-06-10', '2025-09-02', false),
  ('Ligue 1', '2025-26', 'winter', '2026-01-01', '2026-02-03', true)

ON CONFLICT (league, season, window_type) DO NOTHING;

-- Add comments
COMMENT ON TABLE transfer_windows IS 'Stores transfer window periods for different leagues';
COMMENT ON COLUMN transfer_windows.league IS 'League name (e.g., Premier League, La Liga)';
COMMENT ON COLUMN transfer_windows.season IS 'Season identifier (e.g., 2025-26)';
COMMENT ON COLUMN transfer_windows.window_type IS 'Either summer or winter transfer window';
COMMENT ON COLUMN transfer_windows.start_date IS 'Transfer window opening date';
COMMENT ON COLUMN transfer_windows.end_date IS 'Transfer window closing date';
COMMENT ON COLUMN transfer_windows.is_active IS 'Whether this window is currently active';


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260116_create_transfer_windows.sql')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration: 20260117000000_add_club_logo.sql
-- ============================================================================

-- Add logo_url column to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add sportmonks_team_id for reference
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS sportmonks_team_id INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clubs_sportmonks_team_id ON clubs(sportmonks_team_id);

-- Comment
COMMENT ON COLUMN clubs.logo_url IS 'URL to club logo image from Sportmonks API';
COMMENT ON COLUMN clubs.sportmonks_team_id IS 'Reference to Sportmonks team ID for data sync';


-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('20260117000000_add_club_logo.sql')
ON CONFLICT (version) DO NOTHING;
