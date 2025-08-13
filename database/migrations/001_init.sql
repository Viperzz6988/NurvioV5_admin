-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Leaderboard best scores per user+game
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id TEXT NOT NULL,
  game TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, game),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON leaderboard (game, score DESC);