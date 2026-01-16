-- Add logo_url column to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add sportmonks_team_id for reference
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS sportmonks_team_id INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clubs_sportmonks_team_id ON clubs(sportmonks_team_id);

-- Comment
COMMENT ON COLUMN clubs.logo_url IS 'URL to club logo image from Sportmonks API';
COMMENT ON COLUMN clubs.sportmonks_team_id IS 'Reference to Sportmonks team ID for data sync';
