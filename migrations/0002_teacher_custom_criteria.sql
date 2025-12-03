-- Migration: Add teacher custom criteria table
-- This allows assigning custom evaluation criteria to specific teachers

CREATE TABLE IF NOT EXISTS teacher_custom_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  criteria_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, criteria_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teacher_custom_criteria_teacher ON teacher_custom_criteria(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_custom_criteria_criteria ON teacher_custom_criteria(criteria_id);
