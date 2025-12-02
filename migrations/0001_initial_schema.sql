-- جدول المستخدمين (الطلاب والإدارة)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK(user_type IN ('student', 'admin')),
  grade_level TEXT,  -- المرحلة الدراسية (متوسط أول، متوسط ثاني، إلخ)
  class_name TEXT,   -- اسم الفصل (1أ، 1ب، إلخ)
  student_id TEXT,   -- رقم الطالب
  gender TEXT CHECK(gender IN ('male', 'female')),
  reset_token TEXT,
  reset_token_expiry DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المعلمين
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  subject TEXT NOT NULL,  -- المادة الدراسية
  specialization TEXT,    -- التخصص
  email TEXT,
  phone TEXT,
  gender TEXT CHECK(gender IN ('male', 'female')),
  employee_id TEXT UNIQUE,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول ربط المعلمين بالفصول
CREATE TABLE IF NOT EXISTS teacher_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  grade_level TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- جدول معايير التقييم
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  max_score INTEGER NOT NULL DEFAULT 10,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول التقييمات
CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  criteria_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  grade_level TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025',
  evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE
);

-- جدول حالة التقييم للطلاب
CREATE TABLE IF NOT EXISTS evaluation_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  grade_level TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at DATETIME,
  academic_year TEXT NOT NULL DEFAULT '2025',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  UNIQUE(student_id, teacher_id, academic_year, subject)
);

-- جدول الإعدادات العامة
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_grade_class ON users(grade_level, class_name);
CREATE INDEX IF NOT EXISTS idx_teachers_subject ON teachers(subject);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_grade_class ON teacher_classes(grade_level, class_name);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_teacher ON evaluations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_criteria ON evaluations(criteria_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_status_student ON evaluation_status(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_status_teacher ON evaluation_status(teacher_id);
