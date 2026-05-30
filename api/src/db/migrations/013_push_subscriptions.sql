CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         SERIAL PRIMARY KEY,
  family_id  TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id   TEXT REFERENCES children(id) ON DELETE CASCADE,  -- null = parent subscription
  endpoint   TEXT NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_id, endpoint)
);
