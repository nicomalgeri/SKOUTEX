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
