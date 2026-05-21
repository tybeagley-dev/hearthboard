-- Hearthboard local dev schema
-- Used by docker-compose to initialize a fresh database.
-- schema.sql is the canonical base; incremental migrations are folded in here.

CREATE TABLE IF NOT EXISTS chores (
  id           TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  bucks        INTEGER NOT NULL DEFAULT 0,
  icon         TEXT NOT NULL DEFAULT '',
  active       BOOLEAN NOT NULL DEFAULT true,
  required     BOOLEAN NOT NULL DEFAULT false,
  days         TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  max_per_week INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routine_defs (
  id         TEXT PRIMARY KEY,
  child      TEXT NOT NULL,
  label      TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '',
  schedules  TEXT[] NOT NULL DEFAULT '{}',
  time       TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mom_store (
  id                TEXT PRIMARY KEY,
  label             TEXT NOT NULL,
  icon              TEXT NOT NULL DEFAULT '',
  cost              INTEGER NOT NULL DEFAULT 0,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bucks_balance (
  child      TEXT PRIMARY KEY,
  balance    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screen_time_balance (
  child      TEXT PRIMARY KEY,
  balance    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chore_events (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  child       TEXT NOT NULL,
  chore_id    TEXT NOT NULL,
  chore_label TEXT NOT NULL,
  bucks       INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'accepted',
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS chore_events_child_date ON chore_events (child, created_at);
CREATE INDEX IF NOT EXISTS chore_events_status ON chore_events (status);

CREATE TABLE IF NOT EXISTS spend_events (
  id         SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  child      TEXT NOT NULL,
  amount     INTEGER NOT NULL,
  type       TEXT
);

CREATE TABLE IF NOT EXISTS routine_log (
  date       DATE NOT NULL,
  child      TEXT NOT NULL,
  routine_id TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (date, child, routine_id)
);

-- duration_minutes / buffer_minutes already reflect the 003 migration rename
CREATE TABLE IF NOT EXISTS timers (
  child            TEXT PRIMARY KEY,
  end_time         BIGINT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  buffer_minutes   INTEGER NOT NULL DEFAULT 5,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grocery (
  id       TEXT PRIMARY KEY,
  item     TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  day   TEXT PRIMARY KEY,
  main  TEXT NOT NULL DEFAULT '',
  note  TEXT NOT NULL DEFAULT '',
  lunch TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notes (
  id       TEXT PRIMARY KEY,
  text     TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id       TEXT PRIMARY KEY,
  text     TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  child       TEXT NOT NULL,
  item_id     TEXT NOT NULL,
  item_label  TEXT NOT NULL,
  cost        INTEGER NOT NULL,
  redeemed    BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMPTZ
);

-- 002_calendars
CREATE TABLE IF NOT EXISTS calendars (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  url   TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#C17A4A',
  child TEXT  -- 004_calendar_child: nullable = family-wide
);
