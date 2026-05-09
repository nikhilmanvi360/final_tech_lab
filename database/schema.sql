-- Tech Detective - Full Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. teams
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'detective' CHECK (role IN ('detective', 'admin')),
  score INTEGER DEFAULT 0,
  is_disabled BOOLEAN DEFAULT FALSE,
  members JSONB DEFAULT '[]'::jsonb,
  token_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]'::jsonb;

-- 2. cases
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  correct_attacker TEXT,
  points_on_solve INTEGER DEFAULT 100,
  status TEXT DEFAULT 'ACTIVE'
);

-- 3. puzzles
CREATE TABLE IF NOT EXISTS puzzles (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES cases(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  points INTEGER DEFAULT 50,
  hint TEXT,
  depends_on_puzzle_id TEXT
);

-- 4. evidence
CREATE TABLE IF NOT EXISTS evidence (
  id SERIAL PRIMARY KEY,
  case_id TEXT REFERENCES cases(id),
  type TEXT,
  title TEXT,
  content TEXT,
  required_puzzle_id TEXT,
  unlock_at TIMESTAMPTZ
);

-- 5. submissions
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  case_id TEXT REFERENCES cases(id),
  attacker_name TEXT,
  status TEXT,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. solved_puzzles
CREATE TABLE IF NOT EXISTS solved_puzzles (
  team_id INTEGER REFERENCES teams(id),
  puzzle_id TEXT REFERENCES puzzles(id),
  solved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, puzzle_id)
);

-- 7. score_events (Immutable)
CREATE TABLE IF NOT EXISTS score_events (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  event_type TEXT,
  points INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. team_badges
CREATE TABLE IF NOT EXISTS team_badges (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  badge_name TEXT,
  earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. case_team_state
CREATE TABLE IF NOT EXISTS case_team_state (
  team_id INTEGER REFERENCES teams(id),
  case_id TEXT,
  state JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, case_id)
);

-- 10. evidence_codes (Round 1)
CREATE TABLE IF NOT EXISTS evidence_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  points_value INTEGER DEFAULT 0
);

-- 11. campaign_state (Round 2)
CREATE TABLE IF NOT EXISTS campaign_state (
  team_id INTEGER REFERENCES teams(id) PRIMARY KEY,
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  inventory JSONB DEFAULT '[]'::jsonb,
  solved_terminals JSONB DEFAULT '[]'::jsonb,
  collected_clues JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TRIGGERS
-- Trigger to block updates/deletes on score_events to make it append-only
CREATE OR REPLACE FUNCTION block_score_events_modifications()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Updates and deletions on score_events are not allowed.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_score_events_updates
BEFORE UPDATE OR DELETE ON score_events
FOR EACH ROW EXECUTE FUNCTION block_score_events_modifications();

-- Trigger to recompute teams.score when a score_event is added
CREATE OR REPLACE FUNCTION update_team_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teams
  SET score = (
    SELECT COALESCE(SUM(points), 0)
    FROM score_events
    WHERE team_id = NEW.team_id
  )
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_score_on_event
AFTER INSERT ON score_events
FOR EACH ROW EXECUTE FUNCTION update_team_score();

-- SEED DATA (For 3 Teams as requested + Admin)
INSERT INTO teams (name, password, role) VALUES 
('TEAM_ALPHA', '$2b$10$xOYmxWqWxWNdzQ7nQrM1Ie.FUawWKFfpuypX7MupnYiis.BrOHML2', 'detective'), -- Password: demo
('TEAM_BETA', '$2b$10$xOYmxWqWxWNdzQ7nQrM1Ie.FUawWKFfpuypX7MupnYiis.BrOHML2', 'detective'),  -- Password: demo
('TEAM_GAMMA', '$2b$10$xOYmxWqWxWNdzQ7nQrM1Ie.FUawWKFfpuypX7MupnYiis.BrOHML2', 'detective'), -- Password: demo
('ADMIN', '$2b$10$xOYmxWqWxWNdzQ7nQrM1Ie.FUawWKFfpuypX7MupnYiis.BrOHML2', 'admin')          -- Password: demo
ON CONFLICT (name) DO NOTHING;

UPDATE teams
SET password = '$2b$10$xOYmxWqWxWNdzQ7nQrM1Ie.FUawWKFfpuypX7MupnYiis.BrOHML2'
WHERE name IN ('TEAM_ALPHA', 'TEAM_BETA', 'TEAM_GAMMA', 'ADMIN');
