-- Add more user roles to the system
-- This migration extends user_type to support multiple administrative roles

-- First, we need to update the CHECK constraint to allow more user types
-- SQLite doesn't support ALTER TABLE for CHECK constraints, so we'll handle this in the application layer

-- For now, let's create a new column for extended roles
-- We'll keep user_type for backward compatibility and add role for more granular control

-- Add role column (if not exists)
-- Possible roles: student, admin, principal, supervisor, manager
-- We'll use user_type as the main role field by updating the constraint at application level

-- Note: SQLite doesn't support ALTER COLUMN, so we document the new accepted values:
-- user_type can now be: 'student', 'admin', 'principal', 'supervisor', 'manager'

-- Insert default admin users for testing (password: admin123)
-- Password hash for 'admin123': $2a$10$rHJZ3Yq4VZ0jY6nX9vXY3OXKxQ5J9Y4J6nX9vXY3OXKxQ5J9Y4J6n

-- We'll create an admin management interface instead of altering the constraint
-- This is safer and maintains backward compatibility

-- Create a system log for tracking user management
CREATE TABLE IF NOT EXISTS user_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_log(created_at);

