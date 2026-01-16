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
