-- Migration 0008: Admin roles in separate table (حل آمن نهائي)
-- Created: 2025-12-03
-- Purpose: تخزين أدوار المدراء في جدول منفصل بدلاً من user_type

-- إنشاء جدول أدوار المدراء
CREATE TABLE IF NOT EXISTS admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'principal', 'supervisor', 'manager')),
  assigned_by INTEGER,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- نقل البيانات الموجودة (إذا كانت هناك أي مدراء)
-- المدير الرئيسي (id=1) سيكون 'admin'
INSERT OR IGNORE INTO admin_roles (user_id, role)
SELECT id, 'admin' FROM users WHERE id = 1 AND user_type = 'admin';

-- Create index
CREATE INDEX IF NOT EXISTS idx_admin_roles_user ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);
