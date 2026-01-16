-- Push Subscriptions table for Web Push notification delivery
-- Stores browser push subscription credentials (endpoint, keys)

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  expiration_time BIGINT,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Index for endpoint lookups (already unique constraint)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for subscription creation)
CREATE POLICY "Allow anonymous insert" ON push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reading own subscriptions
CREATE POLICY "Allow reading own subscriptions" ON push_subscriptions
  FOR SELECT
  USING (true);

-- Policy: Allow updating own subscriptions
CREATE POLICY "Allow updating own subscriptions" ON push_subscriptions
  FOR UPDATE
  USING (true);

-- Policy: Allow deleting own subscriptions
CREATE POLICY "Allow deleting own subscriptions" ON push_subscriptions
  FOR DELETE
  USING (true);
