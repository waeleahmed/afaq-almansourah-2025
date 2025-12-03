-- Safe migration to fix user_type constraint without losing data
-- This migration disables foreign keys temporarily to prevent CASCADE deletion

-- Disable foreign keys temporarily
PRAGMA foreign_keys = OFF;

-- Step 1: Create new users table with updated constraint
CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK(user_type IN ('student', 'admin', 'principal', 'supervisor', 'manager')),
  grade_level TEXT,
  class_name TEXT,
  student_id TEXT,
  gender TEXT CHECK(gender IN ('male', 'female')),
  reset_token TEXT,
  reset_token_expiry DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy all data from old table to new table
INSERT INTO users_new 
SELECT * FROM users;

-- Step 3: Drop old table
DROP TABLE users;

-- Step 4: Rename new table to users
ALTER TABLE users_new RENAME TO users;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_grade_class ON users(grade_level, class_name);

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;
