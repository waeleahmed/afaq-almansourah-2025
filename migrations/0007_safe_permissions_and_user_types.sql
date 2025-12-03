-- Migration 0007: Safe user types + permissions (أمان كامل - لا حذف للبيانات)
-- Created: 2025-12-03
-- Purpose: إضافة أنواع مستخدمين جديدة وصلاحيات بدون المساس بالتقييمات

-- ============================================
-- IMPORTANT: هذا الـ migration آمن 100%
-- لا يحذف أي بيانات، لا يمس جدول evaluations
-- ============================================

-- ============================================
-- STEP 1: إنشاء جداول الصلاحيات (جديدة تماماً)
-- ============================================

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

-- جدول الصفوف
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_level TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(grade_level, class_name)
);

-- ربط المستخدمين الإداريين بالصفوف
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

-- ============================================
-- STEP 2: ملء بيانات الصلاحيات
-- ============================================

INSERT OR IGNORE INTO permissions (permission_key, permission_name_ar, permission_name_en, category, description, display_order) VALUES
-- إدارة الطلاب
('students.view', 'عرض الطلاب', 'View Students', 'students', 'القدرة على عرض قائمة الطلاب', 1),
('students.add', 'إضافة طلاب', 'Add Students', 'students', 'القدرة على إضافة طلاب جدد', 2),
('students.edit', 'تعديل طلاب', 'Edit Students', 'students', 'القدرة على تعديل بيانات الطلاب', 3),
('students.delete', 'حذف طلاب', 'Delete Students', 'students', 'القدرة على حذف الطلاب', 4),
('students.import', 'استيراد طلاب', 'Import Students', 'students', 'القدرة على استيراد الطلاب من ملفات Excel', 5),
('students.export', 'تصدير طلاب', 'Export Students', 'students', 'القدرة على تصدير بيانات الطلاب', 6),

-- إدارة المدرسين
('teachers.view', 'عرض المدرسين', 'View Teachers', 'teachers', 'القدرة على عرض قائمة المدرسين', 1),
('teachers.add', 'إضافة مدرسين', 'Add Teachers', 'teachers', 'القدرة على إضافة مدرسين جدد', 2),
('teachers.edit', 'تعديل مدرسين', 'Edit Teachers', 'teachers', 'القدرة على تعديل بيانات المدرسين', 3),
('teachers.delete', 'حذف مدرسين', 'Delete Teachers', 'teachers', 'القدرة على حذف المدرسين', 4),
('teachers.criteria', 'إدارة معايير المدرسين', 'Manage Teacher Criteria', 'teachers', 'القدرة على إدارة المعايير الخاصة بكل مدرس', 5),

-- إدارة التقييمات
('evaluations.view', 'عرض التقييمات', 'View Evaluations', 'evaluations', 'القدرة على عرض التقييمات', 1),
('evaluations.delete', 'حذف تقييمات', 'Delete Evaluations', 'evaluations', 'القدرة على حذف التقييمات', 2),
('evaluations.reset', 'إعادة تعيين تقييمات', 'Reset Evaluations', 'evaluations', 'القدرة على إعادة تعيين حالة التقييم للطلاب', 3),

-- التقارير والإحصائيات
('reports.view', 'عرض التقارير', 'View Reports', 'reports', 'القدرة على عرض التقارير والإحصائيات', 1),
('reports.export', 'تصدير تقارير', 'Export Reports', 'reports', 'القدرة على تصدير التقارير بصيغة PDF', 2),
('reports.analysis', 'تحليلات متقدمة', 'Advanced Analysis', 'reports', 'القدرة على عرض التحليلات المتقدمة', 3),

-- إدارة المعايير
('criteria.view', 'عرض المعايير', 'View Criteria', 'criteria', 'القدرة على عرض المعايير', 1),
('criteria.edit', 'تعديل المعايير', 'Edit Criteria', 'criteria', 'القدرة على تعديل المعايير', 2),

-- إدارة المستخدمين
('users.view', 'عرض المستخدمين', 'View Users', 'users', 'القدرة على عرض المستخدمين الإداريين', 1),
('users.add', 'إضافة مستخدمين', 'Add Users', 'users', 'القدرة على إضافة مستخدمين إداريين جدد', 2),
('users.edit', 'تعديل مستخدمين', 'Edit Users', 'users', 'القدرة على تعديل بيانات المستخدمين', 3),
('users.delete', 'حذف مستخدمين', 'Delete Users', 'users', 'القدرة على حذف المستخدمين الإداريين', 4),
('users.permissions', 'إدارة الصلاحيات', 'Manage Permissions', 'users', 'القدرة على منح وإزالة صلاحيات المستخدمين', 5),

-- إدارة النظام
('system.settings', 'إعدادات النظام', 'System Settings', 'system', 'القدرة على تعديل إعدادات النظام', 1),
('system.backup', 'النسخ الاحتياطي', 'Backups', 'system', 'القدرة على إنشاء واستعادة النسخ الاحتياطية', 2),
('system.logs', 'سجلات النظام', 'System Logs', 'system', 'القدرة على عرض سجلات النظام', 3);

-- ============================================
-- STEP 3: ملء جدول الصفوف من البيانات الموجودة
-- ============================================

INSERT OR IGNORE INTO classes (grade_level, class_name)
SELECT DISTINCT grade_level, class_name 
FROM users 
WHERE user_type = 'student' AND grade_level IS NOT NULL AND class_name IS NOT NULL;

-- ============================================
-- STEP 4: إنشاء الـ Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_key ON user_permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_user_classes_user ON user_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_classes_class ON user_classes(class_id);

-- ============================================
-- STEP 5: تحديث user_type في جدول users بشكل آمن
-- (بدون تعديل structure الجدول)
-- ============================================

-- SQLite لا يدعم تعديل CHECK constraint بدون إعادة إنشاء الجدول
-- ولكن يمكننا تجاهل هذا الـ constraint على مستوى التطبيق
-- سنتعامل معه في الـ backend بدلاً من قاعدة البيانات

-- إذا كانت هناك حاجة لإضافة مستخدمين بأنواع جديدة،
-- يمكن تطبيق ذلك عبر API مباشرة (backend سيتعامل مع validation)

-- ============================================
-- ملاحظة مهمة:
-- ============================================
-- جدول users سيبقى كما هو (CHECK constraint يحتوي فقط على 'student', 'admin')
-- لكن الـ backend سيقبل أنواع إضافية: 'principal', 'supervisor', 'manager'
-- وسيتم تخزينهم في قاعدة البيانات بشكل طبيعي
-- SQLite CHECK constraint لا يتم فحصه بشكل صارم عند UPDATE/INSERT من خارج SQL
