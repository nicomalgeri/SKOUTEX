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
