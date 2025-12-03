-- Migration 0006: نظام الصلاحيات للمستخدمين الإداريين
-- Created: 2025-12-03
-- Purpose: إضافة نظام صلاحيات مفصل للمستخدمين الإداريين

-- جدول الصلاحيات المتاحة
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  permission_key TEXT UNIQUE NOT NULL,
  permission_name_ar TEXT NOT NULL,
  permission_name_en TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول ربط المستخدمين بالصلاحيات
CREATE TABLE IF NOT EXISTS user_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  permission_key TEXT NOT NULL,
  granted_by INTEGER NOT NULL,
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id),
  UNIQUE(user_id, permission_key)
);

-- إضافة الصلاحيات الأساسية
INSERT OR IGNORE INTO permissions (permission_key, permission_name_ar, permission_name_en, category, description) VALUES
-- إدارة الطلاب
('students.view', 'عرض الطلاب', 'View Students', 'students', 'القدرة على عرض قائمة الطلاب'),
('students.add', 'إضافة طلاب', 'Add Students', 'students', 'القدرة على إضافة طلاب جدد'),
('students.edit', 'تعديل طلاب', 'Edit Students', 'students', 'القدرة على تعديل بيانات الطلاب'),
('students.delete', 'حذف طلاب', 'Delete Students', 'students', 'القدرة على حذف الطلاب'),
('students.import', 'استيراد طلاب', 'Import Students', 'students', 'القدرة على استيراد الطلاب من ملفات Excel'),
('students.export', 'تصدير طلاب', 'Export Students', 'students', 'القدرة على تصدير بيانات الطلاب'),

-- إدارة المدرسين
('teachers.view', 'عرض المدرسين', 'View Teachers', 'teachers', 'القدرة على عرض قائمة المدرسين'),
('teachers.add', 'إضافة مدرسين', 'Add Teachers', 'teachers', 'القدرة على إضافة مدرسين جدد'),
('teachers.edit', 'تعديل مدرسين', 'Edit Teachers', 'teachers', 'القدرة على تعديل بيانات المدرسين'),
('teachers.delete', 'حذف مدرسين', 'Delete Teachers', 'teachers', 'القدرة على حذف المدرسين'),
('teachers.criteria', 'إدارة معايير المدرسين', 'Manage Teacher Criteria', 'teachers', 'القدرة على إدارة المعايير الخاصة بكل مدرس'),

-- إدارة التقييمات
('evaluations.view', 'عرض التقييمات', 'View Evaluations', 'evaluations', 'القدرة على عرض التقييمات'),
('evaluations.delete', 'حذف تقييمات', 'Delete Evaluations', 'evaluations', 'القدرة على حذف التقييمات'),
('evaluations.reset', 'إعادة تعيين تقييمات', 'Reset Evaluations', 'evaluations', 'القدرة على إعادة تعيين حالة التقييم للطلاب'),

-- التقارير والإحصائيات
('reports.view', 'عرض التقارير', 'View Reports', 'reports', 'القدرة على عرض التقارير والإحصائيات'),
('reports.export', 'تصدير تقارير', 'Export Reports', 'reports', 'القدرة على تصدير التقارير بصيغة PDF'),
('reports.analysis', 'تحليلات متقدمة', 'Advanced Analysis', 'reports', 'القدرة على عرض التحليلات المتقدمة'),

-- إدارة المعايير
('criteria.view', 'عرض المعايير', 'View Criteria', 'criteria', 'القدرة على عرض المعايير'),
('criteria.edit', 'تعديل المعايير', 'Edit Criteria', 'criteria', 'القدرة على تعديل المعايير'),

-- إدارة المستخدمين
('users.view', 'عرض المستخدمين', 'View Users', 'users', 'القدرة على عرض المستخدمين الإداريين'),
('users.add', 'إضافة مستخدمين', 'Add Users', 'users', 'القدرة على إضافة مستخدمين إداريين جدد'),
('users.edit', 'تعديل مستخدمين', 'Edit Users', 'users', 'القدرة على تعديل بيانات المستخدمين'),
('users.delete', 'حذف مستخدمين', 'Delete Users', 'users', 'القدرة على حذف المستخدمين الإداريين'),
('users.permissions', 'إدارة الصلاحيات', 'Manage Permissions', 'users', 'القدرة على منح وإزالة صلاحيات المستخدمين'),

-- إدارة النظام
('system.settings', 'إعدادات النظام', 'System Settings', 'system', 'القدرة على تعديل إعدادات النظام'),
('system.backup', 'النسخ الاحتياطي', 'Backups', 'system', 'القدرة على إنشاء واستعادة النسخ الاحتياطية'),
('system.logs', 'سجلات النظام', 'System Logs', 'system', 'القدرة على عرض سجلات النظام');

-- إضافة كافة الصلاحيات للمستخدم الرئيسي (admin)
-- سيتم تطبيقها عند تسجيل الدخول إذا لم تكن موجودة

-- جدول الصفوف (Classes) لربطها بالمستخدمين
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_level TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(grade_level, class_name)
);

-- ربط المستخدمين الإداريين بالصفوف (للمشرفين ومديري المدارس)
CREATE TABLE IF NOT EXISTS user_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  assigned_by INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE(user_id, class_id)
);

-- إنشاء الصفوف من البيانات الموجودة
INSERT OR IGNORE INTO classes (grade_level, class_name)
SELECT DISTINCT grade_level, class_name 
FROM users 
WHERE user_type = 'student' AND grade_level IS NOT NULL AND class_name IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_key ON user_permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_user_classes_user ON user_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_classes_class ON user_classes(class_id);
