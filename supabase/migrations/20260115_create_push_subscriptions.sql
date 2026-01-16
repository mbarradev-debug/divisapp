-- Push Subscriptions table for Web Push notification delivery
-- Stores browser push subscription credentials (endpoint, keys)
--
-- NOTE: This file documents the ACTUAL schema in Supabase.
-- DO NOT modify the database schema directly.
--
-- Actual columns:
-- - endpoint (text, NOT NULL, UNIQUE) - Push service endpoint URL
-- - p256dh (text, NOT NULL) - Browser public key for encryption
-- - auth (text, NOT NULL) - Auth secret for encryption
-- - user_id (uuid, NULLABLE) - Optional user association
-- - expiration_time (bigint, NULLABLE) - Subscription expiration
-- - user_agent (text, NULLABLE) - Browser user agent string

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT NOT NULL UNIQUE PRIMARY KEY,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID,
  expiration_time BIGINT,
  user_agent TEXT
);

-- Index for endpoint lookups (primary key already indexed)
-- Index for optional user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for subscription creation)
CREATE POLICY "Allow anonymous insert" ON push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reading subscriptions
CREATE POLICY "Allow reading subscriptions" ON push_subscriptions
  FOR SELECT
  USING (true);

-- Policy: Allow updating subscriptions
CREATE POLICY "Allow updating subscriptions" ON push_subscriptions
  FOR UPDATE
  USING (true);

-- Policy: Allow deleting subscriptions
CREATE POLICY "Allow deleting subscriptions" ON push_subscriptions
  FOR DELETE
  USING (true);
