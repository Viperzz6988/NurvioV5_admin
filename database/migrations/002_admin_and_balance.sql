-- Add admin columns and security flags to users
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN force_password_change INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TEXT;

-- Blackjack balance per user
CREATE TABLE IF NOT EXISTS blackjack_balance (
  user_id TEXT PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 1000,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);