import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Types
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// Database Initialization
// ============================================

// Initialize database with schema and seed data
app.post('/api/init-db', async (c) => {
  try {
    const db = c.env.DB

    // Create tables
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          user_type TEXT NOT NULL CHECK(user_type IN ('student', 'admin')),
          grade_level TEXT,
          class_name TEXT,
          student_id TEXT,
          gender TEXT CHECK(gender IN ('male', 'female')),
          reset_token TEXT,
          reset_token_expiry DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS teachers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          subject TEXT NOT NULL,
          specialization TEXT,
          email TEXT,
          phone TEXT,
          gender TEXT CHECK(gender IN ('male', 'female')),
          employee_id TEXT UNIQUE,
          photo_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS teacher_classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER NOT NULL,
          grade_level TEXT NOT NULL,
          class_name TEXT NOT NULL,
          subject TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS evaluation_criteria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          max_score INTEGER NOT NULL DEFAULT 10,
          display_order INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
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
        )
      `),
      db.prepare(`
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
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    ])

    // Insert seed data
    await db.batch([
      // Admin user
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, email) VALUES ('admin', 'admin123', 'مدير النظام', 'admin', 'admin@school.edu.sa')"),
      
      // Evaluation criteria
      db.prepare("INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES (1, 'مدى الاستيعاب', 'قدرة المعلم على إيصال المعلومات بشكل واضح وسهل الفهم', 10, 1, 1)"),
      db.prepare("INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES (2, 'طريقة الشرح', 'فعالية أسلوب التدريس والتوضيح', 10, 2, 1)"),
      db.prepare("INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES (3, 'الاهتمام بتصحيح الواجبات', 'مدى متابعة وتصحيح الواجبات المدرسية', 10, 3, 1)"),
      db.prepare("INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES (4, 'عدم تضييع وقت الحصة', 'استثمار وقت الحصة بشكل فعال', 10, 4, 1)"),
      db.prepare("INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES (5, 'مراعاة ظروف الطلاب', 'التعامل مع الطلاب بمرونة وتفهم', 10, 5, 1)"),
      db.prepare("INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES (6, 'توصيل المعلومات', 'وضوح وفعالية إيصال المعلومات للطلاب', 10, 6, 1)"),
      
      // Teachers
      db.prepare("INSERT OR IGNORE INTO teachers (id, full_name, subject, specialization, employee_id, gender) VALUES (1, 'أحمد محمد السالم', 'رياضيات', 'رياضيات', 'T001', 'male')"),
      db.prepare("INSERT OR IGNORE INTO teachers (id, full_name, subject, specialization, employee_id, gender) VALUES (2, 'فاطمة عبدالله الغامدي', 'لغة عربية', 'لغة عربية', 'T002', 'female')"),
      db.prepare("INSERT OR IGNORE INTO teachers (id, full_name, subject, specialization, employee_id, gender) VALUES (3, 'خالد عبدالعزيز القحطاني', 'علوم', 'فيزياء', 'T003', 'male')"),
      db.prepare("INSERT OR IGNORE INTO teachers (id, full_name, subject, specialization, employee_id, gender) VALUES (4, 'نورة سعد الشهري', 'لغة إنجليزية', 'لغة إنجليزية', 'T004', 'female')"),
      db.prepare("INSERT OR IGNORE INTO teachers (id, full_name, subject, specialization, employee_id, gender) VALUES (5, 'محمد علي الحربي', 'تربية إسلامية', 'شريعة', 'T005', 'male')"),
      
      // Teacher classes - متوسط أول - فصل أ
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (1, 'متوسط أول', '1أ', 'رياضيات')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (2, 'متوسط أول', '1أ', 'لغة عربية')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (3, 'متوسط أول', '1أ', 'علوم')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (4, 'متوسط أول', '1أ', 'لغة إنجليزية')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (5, 'متوسط أول', '1أ', 'تربية إسلامية')"),
      
      // Teacher classes - متوسط أول - فصل ب
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (1, 'متوسط أول', '1ب', 'رياضيات')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (2, 'متوسط أول', '1ب', 'لغة عربية')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (3, 'متوسط أول', '1ب', 'علوم')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (4, 'متوسط أول', '1ب', 'لغة إنجليزية')"),
      db.prepare("INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (5, 'متوسط أول', '1ب', 'تربية إسلامية')"),
      
      // Students - متوسط أول - فصل أ
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student1', 'pass123', 'عبدالرحمن أحمد الزهراني', 'student', 'متوسط أول', '1أ', 'S1001', 'male')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student2', 'pass123', 'عمر محمد العمري', 'student', 'متوسط أول', '1أ', 'S1002', 'male')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student3', 'pass123', 'فيصل خالد المطيري', 'student', 'متوسط أول', '1أ', 'S1003', 'male')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student4', 'pass123', 'سارة علي السبيعي', 'student', 'متوسط أول', '1أ', 'S1004', 'female')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student5', 'pass123', 'مريم سعد الدوسري', 'student', 'متوسط أول', '1أ', 'S1005', 'female')"),
      
      // Students - متوسط أول - فصل ب
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student6', 'pass123', 'يوسف فهد الشمري', 'student', 'متوسط أول', '1ب', 'S1006', 'male')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student7', 'pass123', 'منصور ناصر القرني', 'student', 'متوسط أول', '1ب', 'S1007', 'male')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student8', 'pass123', 'لمى عبدالله الحربي', 'student', 'متوسط أول', '1ب', 'S1008', 'female')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student9', 'pass123', 'ريم محمد الغامدي', 'student', 'متوسط أول', '1ب', 'S1009', 'female')"),
      db.prepare("INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES ('student10', 'pass123', 'نواف عبدالعزيز العتيبي', 'student', 'متوسط أول', '1ب', 'S1010', 'male')"),
      
      // Settings
      db.prepare("INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES ('school_name', 'مدرسة النموذجية المتوسطة', 'اسم المؤسسة التعليمية')"),
      db.prepare("INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES ('school_logo', '/static/images/logo.png', 'شعار المؤسسة التعليمية')"),
      db.prepare("INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES ('academic_year', '2025', 'السنة الأكاديمية الحالية')"),
      db.prepare("INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES ('evaluation_enabled', 'true', 'تفعيل نظام التقييم')"),
      db.prepare("INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES ('min_evaluations', '5', 'الحد الأدنى لعدد التقييمات لظهور النتائج')")
    ])

    return c.json({ success: true, message: 'تم تهيئة قاعدة البيانات بنجاح' })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return c.json({ success: false, message: 'حدث خطأ في تهيئة قاعدة البيانات', error: error.message }, 500)
  }
})

// ============================================
// API Routes - Authentication
// ============================================

// Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const db = c.env.DB

    const user = await db
      .prepare('SELECT * FROM users WHERE username = ? AND password = ?')
      .bind(username, password)
      .first()

    if (!user) {
      return c.json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, 401)
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        user_type: user.user_type,
        grade_level: user.grade_level,
        class_name: user.class_name,
        student_id: user.student_id
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في الخادم' }, 500)
  }
})

// Password reset request
app.post('/api/auth/reset-request', async (c) => {
  try {
    const { username } = await c.req.json()
    const db = c.env.DB

    const user = await db
      .prepare('SELECT id, username, full_name FROM users WHERE username = ?')
      .bind(username)
      .first()

    if (!user) {
      return c.json({ success: false, message: 'اسم المستخدم غير موجود' }, 404)
    }

    // Generate reset token (in production, this should be sent via email)
    const resetToken = Math.random().toString(36).substring(2, 15)
    const expiry = new Date(Date.now() + 3600000).toISOString() // 1 hour

    await db
      .prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
      .bind(resetToken, expiry, user.id)
      .run()

    return c.json({
      success: true,
      message: 'تم إرسال رمز إعادة تعيين كلمة المرور',
      resetToken // In production, send via email instead
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في الخادم' }, 500)
  }
})

// Password reset
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { username, resetToken, newPassword } = await c.req.json()
    const db = c.env.DB

    const user = await db
      .prepare('SELECT id FROM users WHERE username = ? AND reset_token = ? AND reset_token_expiry > datetime("now")')
      .bind(username, resetToken)
      .first()

    if (!user) {
      return c.json({ success: false, message: 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية' }, 400)
    }

    await db
      .prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
      .bind(newPassword, user.id)
      .run()

    return c.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في الخادم' }, 500)
  }
})

// ============================================
// API Routes - Teachers
// ============================================

// Get teachers for student's class
app.get('/api/teachers/:gradeLevel/:className', async (c) => {
  try {
    const gradeLevel = c.req.param('gradeLevel')
    const className = c.req.param('className')
    const db = c.env.DB

    const teachers = await db
      .prepare(`
        SELECT DISTINCT t.id, t.full_name, tc.subject, t.photo_url
        FROM teachers t
        JOIN teacher_classes tc ON t.id = tc.teacher_id
        WHERE tc.grade_level = ? AND tc.class_name = ?
        ORDER BY tc.subject
      `)
      .bind(gradeLevel, className)
      .all()

    return c.json({ success: true, teachers: teachers.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب بيانات المعلمين' }, 500)
  }
})

// ============================================
// API Routes - Evaluation Criteria
// ============================================

// Get active evaluation criteria
app.get('/api/criteria', async (c) => {
  try {
    const db = c.env.DB

    const criteria = await db
      .prepare('SELECT * FROM evaluation_criteria WHERE is_active = 1 ORDER BY display_order')
      .all()

    return c.json({ success: true, criteria: criteria.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب معايير التقييم' }, 500)
  }
})

// ============================================
// API Routes - Evaluations
// ============================================

// Check if student has already evaluated a teacher
app.get('/api/evaluation/status/:studentId/:teacherId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    const teacherId = c.req.param('teacherId')
    const db = c.env.DB

    const status = await db
      .prepare(`
        SELECT is_completed, completed_at 
        FROM evaluation_status 
        WHERE student_id = ? AND teacher_id = ? AND academic_year = '2025'
      `)
      .bind(studentId, teacherId)
      .first()

    return c.json({ 
      success: true, 
      completed: status ? status.is_completed === 1 : false,
      completedAt: status?.completed_at 
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في التحقق من حالة التقييم' }, 500)
  }
})

// Submit evaluation
app.post('/api/evaluation/submit', async (c) => {
  try {
    const { studentId, teacherId, gradeLevel, className, subject, evaluations } = await c.req.json()
    const db = c.env.DB

    // Check if already evaluated
    const existing = await db
      .prepare('SELECT id FROM evaluation_status WHERE student_id = ? AND teacher_id = ? AND academic_year = ?')
      .bind(studentId, teacherId, '2025')
      .first()

    if (existing && existing.is_completed === 1) {
      return c.json({ success: false, message: 'لقد قمت بتقييم هذا المعلم مسبقاً' }, 400)
    }

    // Insert evaluations
    for (const evaluation of evaluations) {
      await db
        .prepare(`
          INSERT INTO evaluations (student_id, teacher_id, criteria_id, score, grade_level, class_name, subject, academic_year)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          studentId,
          teacherId,
          evaluation.criteriaId,
          evaluation.score,
          gradeLevel,
          className,
          subject,
          '2025'
        )
        .run()
    }

    // Update evaluation status
    if (existing) {
      await db
        .prepare('UPDATE evaluation_status SET is_completed = 1, completed_at = datetime("now") WHERE id = ?')
        .bind(existing.id)
        .run()
    } else {
      await db
        .prepare(`
          INSERT INTO evaluation_status (student_id, teacher_id, grade_level, class_name, subject, is_completed, completed_at, academic_year)
          VALUES (?, ?, ?, ?, ?, 1, datetime("now"), ?)
        `)
        .bind(studentId, teacherId, gradeLevel, className, subject, '2025')
        .run()
    }

    return c.json({ success: true, message: 'تم تسجيل التقييم بنجاح' })
  } catch (error) {
    console.error('Error submitting evaluation:', error)
    return c.json({ success: false, message: 'حدث خطأ في تسجيل التقييم' }, 500)
  }
})

// Get student evaluation report for a specific teacher
app.get('/api/evaluation/student-report/:studentId/:teacherId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    const teacherId = c.req.param('teacherId')
    const db = c.env.DB

    // Get student info
    const student = await db
      .prepare('SELECT id, full_name, grade_level, class_name FROM users WHERE id = ? AND user_type = "student"')
      .bind(studentId)
      .first()

    if (!student) {
      return c.json({ success: false, message: 'الطالب غير موجود' }, 404)
    }

    // Get teacher info
    const teacher = await db
      .prepare('SELECT id, full_name, subject FROM teachers WHERE id = ?')
      .bind(teacherId)
      .first()

    if (!teacher) {
      return c.json({ success: false, message: 'المعلم غير موجود' }, 404)
    }

    // Get evaluations
    const evaluations = await db
      .prepare(`
        SELECT 
          e.score,
          ec.title as criteria_title,
          ec.max_score
        FROM evaluations e
        JOIN evaluation_criteria ec ON e.criteria_id = ec.id
        WHERE e.student_id = ? AND e.teacher_id = ? AND e.academic_year = '2025'
        ORDER BY ec.display_order
      `)
      .bind(studentId, teacherId)
      .all()

    return c.json({
      success: true,
      student,
      teacher,
      evaluations: evaluations.results
    })
  } catch (error) {
    console.error('Error getting student evaluation report:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب تقرير التقييم' }, 500)
  }
})

// ============================================
// API Routes - Admin - Criteria Management
// ============================================

// Get all criteria (including inactive)
app.get('/api/admin/criteria/all', async (c) => {
  try {
    const db = c.env.DB
    const criteria = await db
      .prepare('SELECT * FROM evaluation_criteria ORDER BY display_order')
      .all()
    
    return c.json({ success: true, criteria: criteria.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب المعايير' }, 500)
  }
})

// Add new criterion
app.post('/api/admin/criteria/add', async (c) => {
  try {
    const { title, description, max_score } = await c.req.json()
    const db = c.env.DB
    
    // Get max display order
    const maxOrder = await db
      .prepare('SELECT MAX(display_order) as max_order FROM evaluation_criteria')
      .first()
    
    const newOrder = (maxOrder?.max_order || 0) + 1
    
    const result = await db
      .prepare(`
        INSERT INTO evaluation_criteria (title, description, max_score, display_order)
        VALUES (?, ?, ?, ?)
      `)
      .bind(title, description || null, max_score, newOrder)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم إضافة المعيار بنجاح',
      criteriaId: result.meta.last_row_id 
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في إضافة المعيار' }, 500)
  }
})

// Update criterion
app.put('/api/admin/criteria/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { title, description, max_score, is_active } = await c.req.json()
    const db = c.env.DB
    
    await db
      .prepare(`
        UPDATE evaluation_criteria 
        SET title = ?, description = ?, max_score = ?, is_active = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(title, description || null, max_score, is_active ? 1 : 0, id)
      .run()
    
    return c.json({ success: true, message: 'تم تحديث المعيار بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث المعيار' }, 500)
  }
})

// Update criterion max score and recalculate
app.put('/api/admin/criteria/:id/score', async (c) => {
  try {
    const id = c.req.param('id')
    const { max_score } = await c.req.json()
    const db = c.env.DB
    
    // Get old max score
    const criterion = await db
      .prepare('SELECT max_score FROM evaluation_criteria WHERE id = ?')
      .bind(id)
      .first()
    
    if (!criterion) {
      return c.json({ success: false, message: 'المعيار غير موجود' }, 404)
    }
    
    const oldMaxScore = criterion.max_score as number
    const ratio = max_score / oldMaxScore
    
    // Update criterion
    await db
      .prepare('UPDATE evaluation_criteria SET max_score = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(max_score, id)
      .run()
    
    // Recalculate all evaluations for this criterion
    await db
      .prepare(`
        UPDATE evaluations 
        SET score = CAST(ROUND(score * ?) AS INTEGER)
        WHERE criteria_id = ?
      `)
      .bind(ratio, id)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم تحديث الدرجة وإعادة احتساب جميع التقييمات بنجاح',
      ratio 
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث الدرجة' }, 500)
  }
})

// Delete criterion
app.delete('/api/admin/criteria/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Check if there are evaluations using this criterion
    const evaluations = await db
      .prepare('SELECT COUNT(*) as count FROM evaluations WHERE criteria_id = ?')
      .bind(id)
      .first()
    
    if (evaluations && evaluations.count > 0) {
      return c.json({ 
        success: false, 
        message: 'لا يمكن حذف هذا المعيار لأن هناك تقييمات مرتبطة به. يمكنك تعطيله بدلاً من ذلك.' 
      }, 400)
    }
    
    await db
      .prepare('DELETE FROM evaluation_criteria WHERE id = ?')
      .bind(id)
      .run()
    
    return c.json({ success: true, message: 'تم حذف المعيار بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في حذف المعيار' }, 500)
  }
})

// Reorder criteria
app.put('/api/admin/criteria/reorder', async (c) => {
  try {
    const { criteria } = await c.req.json() // Array of {id, display_order}
    const db = c.env.DB
    
    const updates = criteria.map((item: any) => 
      db.prepare('UPDATE evaluation_criteria SET display_order = ? WHERE id = ?')
        .bind(item.display_order, item.id)
    )
    
    await db.batch(updates)
    
    return c.json({ success: true, message: 'تم تحديث ترتيب المعايير بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث الترتيب' }, 500)
  }
})

// ============================================
// API Routes - Admin - Statistics
// ============================================

// Get overall statistics
app.get('/api/admin/stats/overview', async (c) => {
  try {
    const db = c.env.DB
    
    // Get counts
    const students = await db.prepare('SELECT COUNT(*) as count FROM users WHERE user_type = "student"').first()
    const teachers = await db.prepare('SELECT COUNT(*) as count FROM teachers').first()
    const evaluations = await db.prepare('SELECT COUNT(*) as count FROM evaluations').first()
    const completedEvals = await db.prepare('SELECT COUNT(*) as count FROM evaluation_status WHERE is_completed = 1').first()
    
    return c.json({
      success: true,
      stats: {
        totalStudents: students?.count || 0,
        totalTeachers: teachers?.count || 0,
        totalEvaluations: evaluations?.count || 0,
        completedEvaluations: completedEvals?.count || 0
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب الإحصائيات' }, 500)
  }
})

// Get all teachers with their evaluation stats
app.get('/api/admin/teachers/stats', async (c) => {
  try {
    const db = c.env.DB
    
    const teachers = await db
      .prepare(`
        SELECT 
          t.id,
          t.full_name,
          t.subject,
          t.specialization,
          COUNT(DISTINCT e.student_id) as total_evaluations,
          AVG(e.score) as avg_score,
          MIN(e.score) as min_score,
          MAX(e.score) as max_score
        FROM teachers t
        LEFT JOIN evaluations e ON t.id = e.teacher_id AND e.academic_year = '2025'
        GROUP BY t.id, t.full_name, t.subject, t.specialization
        ORDER BY t.full_name
      `)
      .all()
    
    return c.json({ success: true, teachers: teachers.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب إحصائيات المعلمين' }, 500)
  }
})

// Get subject comparison
app.get('/api/admin/stats/by-subject', async (c) => {
  try {
    const db = c.env.DB
    
    const stats = await db
      .prepare(`
        SELECT 
          t.subject,
          COUNT(DISTINCT t.id) as teacher_count,
          COUNT(DISTINCT e.student_id) as total_evaluations,
          AVG(e.score) as avg_score
        FROM teachers t
        LEFT JOIN evaluations e ON t.id = e.teacher_id AND e.academic_year = '2025'
        GROUP BY t.subject
        ORDER BY avg_score DESC
      `)
      .all()
    
    return c.json({ success: true, stats: stats.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب إحصائيات المواد' }, 500)
  }
})

// Get class comparison
app.get('/api/admin/stats/by-class', async (c) => {
  try {
    const db = c.env.DB
    
    const stats = await db
      .prepare(`
        SELECT 
          e.grade_level,
          e.class_name,
          COUNT(DISTINCT e.student_id) as student_count,
          COUNT(DISTINCT e.teacher_id) as teacher_count,
          COUNT(*) as total_evaluations,
          AVG(e.score) as avg_score
        FROM evaluations e
        WHERE e.academic_year = '2025'
        GROUP BY e.grade_level, e.class_name
        ORDER BY e.grade_level, e.class_name
      `)
      .all()
    
    return c.json({ success: true, stats: stats.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب إحصائيات الفصول' }, 500)
  }
})

// ============================================
// API Routes - Admin - Students Management
// ============================================

// Get all students
app.get('/api/admin/students', async (c) => {
  try {
    const db = c.env.DB
    const students = await db
      .prepare(`
        SELECT 
          u.*,
          COUNT(DISTINCT es.teacher_id) as completed_evaluations
        FROM users u
        LEFT JOIN evaluation_status es ON u.id = es.student_id AND es.is_completed = 1
        WHERE u.user_type = 'student'
        GROUP BY u.id
        ORDER BY u.grade_level, u.class_name, u.full_name
      `)
      .all()
    
    return c.json({ success: true, students: students.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب الطلاب' }, 500)
  }
})

// Get student by ID
app.get('/api/admin/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    const student = await db
      .prepare('SELECT * FROM users WHERE id = ? AND user_type = "student"')
      .bind(id)
      .first()
    
    if (!student) {
      return c.json({ success: false, message: 'الطالب غير موجود' }, 404)
    }
    
    return c.json({ success: true, student })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب بيانات الطالب' }, 500)
  }
})

// Get student evaluations (teachers evaluated by this student)
app.get('/api/admin/students/:id/evaluations', async (c) => {
  try {
    const studentId = c.req.param('id')
    const db = c.env.DB
    
    const evaluations = await db
      .prepare(`
        SELECT 
          t.id as teacher_id,
          t.full_name as teacher_name,
          t.subject,
          COUNT(DISTINCT e.id) as evaluation_count,
          AVG(e.score / ec.max_score * 10) as average_score
        FROM evaluations e
        JOIN teachers t ON e.teacher_id = t.id
        JOIN evaluation_criteria ec ON e.criteria_id = ec.id
        WHERE e.student_id = ? AND e.academic_year = '2025'
        GROUP BY t.id, t.full_name, t.subject
        ORDER BY t.full_name
      `)
      .bind(studentId)
      .all()
    
    return c.json({ 
      success: true, 
      evaluations: evaluations.results 
    })
  } catch (error) {
    console.error('Error getting student evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب التقييمات' }, 500)
  }
})

// Add new student
app.post('/api/admin/students', async (c) => {
  try {
    const { username, password, full_name, email, phone, grade_level, class_name, student_id, gender } = await c.req.json()
    const db = c.env.DB
    
    // Check if username exists
    const existing = await db
      .prepare('SELECT id FROM users WHERE username = ?')
      .bind(username)
      .first()
    
    if (existing) {
      return c.json({ success: false, message: 'اسم المستخدم موجود مسبقاً' }, 400)
    }
    
    const result = await db
      .prepare(`
        INSERT INTO users (username, password, full_name, email, phone, user_type, grade_level, class_name, student_id, gender)
        VALUES (?, ?, ?, ?, ?, 'student', ?, ?, ?, ?)
      `)
      .bind(username, password, full_name, email || null, phone || null, grade_level, class_name, student_id, gender)
      .run()
    
    return c.json({ success: true, message: 'تم إضافة الطالب بنجاح', studentId: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في إضافة الطالب' }, 500)
  }
})

// Update student
app.put('/api/admin/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { username, password, full_name, email, phone, grade_level, class_name, student_id, gender } = await c.req.json()
    const db = c.env.DB
    
    // Check if username exists for another student
    const existing = await db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .bind(username, id)
      .first()
    
    if (existing) {
      return c.json({ success: false, message: 'اسم المستخدم موجود مسبقاً' }, 400)
    }
    
    // Update with or without password
    if (password && password.trim() !== '') {
      await db
        .prepare(`
          UPDATE users 
          SET username = ?, password = ?, full_name = ?, email = ?, phone = ?, 
              grade_level = ?, class_name = ?, student_id = ?, gender = ?, updated_at = datetime('now')
          WHERE id = ? AND user_type = 'student'
        `)
        .bind(username, password, full_name, email || null, phone || null, grade_level, class_name, student_id, gender, id)
        .run()
    } else {
      await db
        .prepare(`
          UPDATE users 
          SET username = ?, full_name = ?, email = ?, phone = ?, 
              grade_level = ?, class_name = ?, student_id = ?, gender = ?, updated_at = datetime('now')
          WHERE id = ? AND user_type = 'student'
        `)
        .bind(username, full_name, email || null, phone || null, grade_level, class_name, student_id, gender, id)
        .run()
    }
    
    return c.json({ success: true, message: 'تم تحديث بيانات الطالب بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث بيانات الطالب' }, 500)
  }
})

// Delete student
app.delete('/api/admin/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const forceDelete = c.req.query('force') === 'true'
    const db = c.env.DB
    
    // Check if student has evaluations
    const evaluations = await db
      .prepare('SELECT COUNT(*) as count FROM evaluations WHERE student_id = ?')
      .bind(id)
      .first()
    
    if (evaluations && evaluations.count > 0) {
      if (!forceDelete) {
        return c.json({ 
          success: false, 
          message: 'لا يمكن حذف الطالب لوجود تقييمات مرتبطة به',
          hasEvaluations: true,
          evaluationCount: evaluations.count
        }, 400)
      }
      
      // Force delete: Delete evaluations first
      await db
        .prepare('DELETE FROM evaluations WHERE student_id = ?')
        .bind(id)
        .run()
      
      await db
        .prepare('DELETE FROM evaluation_status WHERE student_id = ?')
        .bind(id)
        .run()
    }
    
    await db
      .prepare('DELETE FROM users WHERE id = ? AND user_type = "student"')
      .bind(id)
      .run()
    
    return c.json({ success: true, message: 'تم حذف الطالب بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في حذف الطالب' }, 500)
  }
})

// Bulk upload students from Excel
app.post('/api/admin/students/bulk-upload', async (c) => {
  try {
    const { students } = await c.req.json()
    const db = c.env.DB
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return c.json({ success: false, message: 'لا توجد بيانات للرفع' }, 400)
    }
    
    let inserted = 0
    let skipped = 0
    const errors = []
    
    for (const student of students) {
      try {
        // Check if username already exists
        const existing = await db
          .prepare('SELECT id FROM users WHERE username = ?')
          .bind(student.username)
          .first()
        
        if (existing) {
          skipped++
          errors.push(`اسم المستخدم ${student.username} موجود مسبقاً`)
          continue
        }
        
        // Insert student
        await db
          .prepare(`
            INSERT INTO users (username, password, full_name, email, phone, user_type, grade_level, class_name, student_id, gender)
            VALUES (?, ?, ?, ?, ?, 'student', ?, ?, ?, ?)
          `)
          .bind(
            student.username,
            student.password, // Note: In production, hash the password
            student.full_name,
            student.email,
            student.phone,
            student.grade_level,
            student.class_name,
            student.student_id,
            student.gender
          )
          .run()
        
        inserted++
      } catch (error) {
        console.error(`Error inserting student ${student.full_name}:`, error)
        skipped++
        errors.push(`خطأ في الصف: ${student.full_name} - ${error.message || 'خطأ غير معروف'}`)
      }
    }
    
    return c.json({ 
      success: true, 
      inserted,
      skipped,
      errors: errors.slice(0, 10), // Return first 10 errors only
      message: `تم رفع ${inserted} طالب، تم تخطي ${skipped}`
    })
  } catch (error) {
    console.error('Error bulk uploading students:', error)
    return c.json({ success: false, message: 'حدث خطأ في رفع البيانات' }, 500)
  }
})

// ============================================
// API Routes - Admin - Teachers Management
// ============================================

// Get all teachers with details
app.get('/api/admin/teachers', async (c) => {
  try {
    const db = c.env.DB
    const teachers = await db
      .prepare(`
        SELECT 
          t.*,
          COUNT(DISTINCT tc.id) as classes_count,
          COUNT(DISTINCT e.student_id) as total_evaluations
        FROM teachers t
        LEFT JOIN teacher_classes tc ON t.id = tc.teacher_id
        LEFT JOIN evaluations e ON t.id = e.teacher_id
        GROUP BY t.id
        ORDER BY t.full_name
      `)
      .all()
    
    return c.json({ success: true, teachers: teachers.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب المعلمين' }, 500)
  }
})

// Get teacher by ID with classes
app.get('/api/admin/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    const teacher = await db
      .prepare('SELECT * FROM teachers WHERE id = ?')
      .bind(id)
      .first()
    
    if (!teacher) {
      return c.json({ success: false, message: 'المعلم غير موجود' }, 404)
    }
    
    const classes = await db
      .prepare('SELECT * FROM teacher_classes WHERE teacher_id = ?')
      .bind(id)
      .all()
    
    return c.json({ success: true, teacher, classes: classes.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب بيانات المعلم' }, 500)
  }
})

// Add new teacher
app.post('/api/admin/teachers', async (c) => {
  try {
    const { full_name, subject, specialization, email, phone, gender, employee_id, photo_url } = await c.req.json()
    const db = c.env.DB
    
    // Check if employee_id exists
    if (employee_id) {
      const existing = await db
        .prepare('SELECT id FROM teachers WHERE employee_id = ?')
        .bind(employee_id)
        .first()
      
      if (existing) {
        return c.json({ success: false, message: 'الرقم الوظيفي موجود مسبقاً' }, 400)
      }
    }
    
    const result = await db
      .prepare(`
        INSERT INTO teachers (full_name, subject, specialization, email, phone, gender, employee_id, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(full_name, subject, specialization || null, email || null, phone || null, gender, employee_id || null, photo_url || null)
      .run()
    
    return c.json({ success: true, message: 'تم إضافة المعلم بنجاح', teacherId: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في إضافة المعلم' }, 500)
  }
})

// Update teacher
app.put('/api/admin/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { full_name, subject, specialization, email, phone, gender, employee_id, photo_url } = await c.req.json()
    const db = c.env.DB
    
    // Check if employee_id exists for another teacher
    if (employee_id) {
      const existing = await db
        .prepare('SELECT id FROM teachers WHERE employee_id = ? AND id != ?')
        .bind(employee_id, id)
        .first()
      
      if (existing) {
        return c.json({ success: false, message: 'الرقم الوظيفي موجود مسبقاً' }, 400)
      }
    }
    
    await db
      .prepare(`
        UPDATE teachers 
        SET full_name = ?, subject = ?, specialization = ?, email = ?, phone = ?, 
            gender = ?, employee_id = ?, photo_url = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(full_name, subject, specialization || null, email || null, phone || null, gender, employee_id || null, photo_url || null, id)
      .run()
    
    return c.json({ success: true, message: 'تم تحديث بيانات المعلم بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث بيانات المعلم' }, 500)
  }
})

// Delete teacher
app.delete('/api/admin/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const forceDelete = c.req.query('force') === 'true' // Add force parameter
    const db = c.env.DB
    
    // Check if teacher has evaluations
    const evaluations = await db
      .prepare('SELECT COUNT(*) as count FROM evaluations WHERE teacher_id = ?')
      .bind(id)
      .first()
    
    if (evaluations && evaluations.count > 0) {
      if (!forceDelete) {
        return c.json({ 
          success: false, 
          message: 'لا يمكن حذف المعلم لوجود تقييمات مرتبطة به',
          hasEvaluations: true,
          evaluationCount: evaluations.count
        }, 400)
      }
      
      // Force delete: Delete evaluations first
      await db
        .prepare('DELETE FROM evaluations WHERE teacher_id = ?')
        .bind(id)
        .run()
      
      await db
        .prepare('DELETE FROM evaluation_status WHERE teacher_id = ?')
        .bind(id)
        .run()
    }
    
    // Delete teacher (will cascade delete teacher_classes)
    await db
      .prepare('DELETE FROM teachers WHERE id = ?')
      .bind(id)
      .run()
    
    return c.json({ success: true, message: 'تم حذف المعلم بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في حذف المعلم' }, 500)
  }
})

// Delete all evaluations for a teacher
app.delete('/api/admin/teachers/:id/evaluations', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const db = c.env.DB
    
    // Delete evaluations
    const result = await db
      .prepare('DELETE FROM evaluations WHERE teacher_id = ?')
      .bind(teacherId)
      .run()
    
    // Delete evaluation status
    await db
      .prepare('DELETE FROM evaluation_status WHERE teacher_id = ?')
      .bind(teacherId)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم حذف جميع التقييمات بنجاح',
      deletedCount: result.meta.changes || 0
    })
  } catch (error) {
    console.error('Error deleting teacher evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف التقييمات' }, 500)
  }
})

// Delete all evaluations for a student
app.delete('/api/admin/students/:id/evaluations', async (c) => {
  try {
    const studentId = c.req.param('id')
    const db = c.env.DB
    
    // Delete evaluations
    const result = await db
      .prepare('DELETE FROM evaluations WHERE student_id = ?')
      .bind(studentId)
      .run()
    
    // Delete evaluation status
    await db
      .prepare('DELETE FROM evaluation_status WHERE student_id = ?')
      .bind(studentId)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم حذف جميع التقييمات بنجاح',
      deletedCount: result.meta.changes || 0
    })
  } catch (error) {
    console.error('Error deleting student evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف التقييمات' }, 500)
  }
})

// Bulk upload teachers from Excel
app.post('/api/admin/teachers/bulk-upload', async (c) => {
  try {
    const { teachers } = await c.req.json()
    const db = c.env.DB
    
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return c.json({ success: false, message: 'لا توجد بيانات للرفع' }, 400)
    }
    
    let inserted = 0
    let skipped = 0
    const errors = []
    
    for (const teacher of teachers) {
      try {
        // Check if employee_id already exists
        const existing = await db
          .prepare('SELECT id FROM teachers WHERE employee_id = ?')
          .bind(teacher.employee_id)
          .first()
        
        if (existing) {
          skipped++
          errors.push(`الرقم الوظيفي ${teacher.employee_id} موجود مسبقاً`)
          continue
        }
        
        // Insert teacher
        await db
          .prepare(`
            INSERT INTO teachers (employee_id, full_name, subject, specialization, email, phone, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            teacher.employee_id,
            teacher.full_name,
            teacher.subject,
            teacher.specialization,
            teacher.email,
            teacher.phone,
            teacher.gender
          )
          .run()
        
        inserted++
      } catch (error) {
        skipped++
        errors.push(`خطأ في الصف: ${teacher.full_name}`)
      }
    }
    
    return c.json({ 
      success: true, 
      inserted,
      skipped,
      errors: errors.slice(0, 10),
      message: `تم رفع ${inserted} معلم، تم تخطي ${skipped}`
    })
  } catch (error) {
    console.error('Error bulk uploading teachers:', error)
    return c.json({ success: false, message: 'حدث خطأ في رفع البيانات' }, 500)
  }
})

// Get teacher classes
app.get('/api/admin/teachers/:id/classes', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const db = c.env.DB
    
    const result = await db
      .prepare('SELECT * FROM teacher_classes WHERE teacher_id = ?')
      .bind(teacherId)
      .all()
    
    return c.json({ success: true, classes: result.results || [] })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب الفصول' }, 500)
  }
})

// Assign teacher to class
app.post('/api/admin/teachers/:id/classes', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const { grade_level, class_name, subject } = await c.req.json()
    const db = c.env.DB
    
    // Check if assignment already exists
    const existing = await db
      .prepare('SELECT id FROM teacher_classes WHERE teacher_id = ? AND grade_level = ? AND class_name = ? AND subject = ?')
      .bind(teacherId, grade_level, class_name, subject)
      .first()
    
    if (existing) {
      return c.json({ success: false, message: 'المعلم مُعيّن بالفعل لهذا الفصل والمادة' }, 400)
    }
    
    await db
      .prepare('INSERT INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES (?, ?, ?, ?)')
      .bind(teacherId, grade_level, class_name, subject)
      .run()
    
    return c.json({ success: true, message: 'تم تعيين المعلم للفصل بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تعيين المعلم' }, 500)
  }
})

// Remove teacher from class
app.delete('/api/admin/teachers/:teacherId/classes/:classId', async (c) => {
  try {
    const classId = c.req.param('classId')
    const db = c.env.DB
    
    await db
      .prepare('DELETE FROM teacher_classes WHERE id = ?')
      .bind(classId)
      .run()
    
    return c.json({ success: true, message: 'تم إلغاء تعيين المعلم من الفصل' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في إلغاء التعيين' }, 500)
  }
})

// ============================================
// API Routes - Admin Reports
// ============================================

// Get teacher report
app.get('/api/admin/teacher-report/:teacherId', async (c) => {
  try {
    const teacherId = c.req.param('teacherId')
    const db = c.env.DB

    // Get teacher info with total evaluations and average
    const teacher = await db
      .prepare(`
        SELECT 
          t.*,
          COUNT(DISTINCT e.id) as total_evaluations,
          AVG(e.score) as average_score
        FROM teachers t
        LEFT JOIN evaluations e ON t.id = e.teacher_id AND e.academic_year = '2025'
        WHERE t.id = ?
        GROUP BY t.id
      `)
      .bind(teacherId)
      .first()

    if (!teacher) {
      return c.json({ success: false, message: 'المعلم غير موجود' }, 404)
    }

    // Get evaluation statistics by criteria
    const criteria = await db
      .prepare(`
        SELECT 
          ec.id,
          ec.title,
          ec.max_score,
          AVG(e.score) as average_score,
          COUNT(e.id) as evaluation_count
        FROM evaluation_criteria ec
        LEFT JOIN evaluations e ON ec.id = e.criteria_id AND e.teacher_id = ? AND e.academic_year = '2025'
        WHERE ec.is_active = 1
        GROUP BY ec.id, ec.title, ec.max_score
        ORDER BY ec.display_order
      `)
      .bind(teacherId)
      .all()

    // Get class-wise statistics
    const classes = await db
      .prepare(`
        SELECT 
          grade_level,
          class_name,
          COUNT(DISTINCT student_id) as student_count,
          AVG(score) as average_score
        FROM evaluations
        WHERE teacher_id = ? AND academic_year = '2025'
        GROUP BY grade_level, class_name
        ORDER BY grade_level, class_name
      `)
      .bind(teacherId)
      .all()

    return c.json({
      success: true,
      teacher,
      criteria: criteria.results,
      classes: classes.results
    })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب تقرير المعلم' }, 500)
  }
})

// Get all teachers with statistics (must be before /:id route)
app.get('/api/admin/teachers-all', async (c) => {
  try {
    const db = c.env.DB
    
    const teachers = await db
      .prepare(`
        SELECT 
          t.*,
          COUNT(DISTINCT e.id) as total_evaluations,
          AVG(e.score) as average_score
        FROM teachers t
        LEFT JOIN evaluations e ON t.id = e.teacher_id AND e.academic_year = '2025'
        GROUP BY t.id
        ORDER BY t.full_name
      `)
      .all()
    
    return c.json({ success: true, teachers: teachers.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب بيانات المعلمين' }, 500)
  }
})

// Get report by subject
app.get('/api/admin/reports/by-subject', async (c) => {
  try {
    const db = c.env.DB
    
    const subjects = await db
      .prepare(`
        SELECT 
          t.subject,
          COUNT(DISTINCT t.id) as teacher_count,
          COUNT(DISTINCT e.id) as evaluation_count,
          AVG(e.score) as average_score
        FROM teachers t
        LEFT JOIN evaluations e ON t.id = e.teacher_id AND e.academic_year = '2025'
        GROUP BY t.subject
        ORDER BY average_score DESC
      `)
      .all()
    
    return c.json({ success: true, subjects: subjects.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب تقرير المواد' }, 500)
  }
})

// Get report by class
app.get('/api/admin/reports/by-class', async (c) => {
  try {
    const db = c.env.DB
    
    const classes = await db
      .prepare(`
        SELECT 
          e.grade_level,
          e.class_name,
          COUNT(DISTINCT e.student_id) as student_count,
          COUNT(DISTINCT e.id) as evaluation_count,
          AVG(e.score) as average_score
        FROM evaluations e
        WHERE e.academic_year = '2025'
        GROUP BY e.grade_level, e.class_name
        ORDER BY e.grade_level, e.class_name
      `)
      .all()
    
    return c.json({ success: true, classes: classes.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب تقرير الفصول' }, 500)
  }
})

// ============================================
// Teacher Strength & Weakness Analysis APIs
// ============================================

// Get teacher strengths and weaknesses by filter
app.get('/api/admin/teachers/:id/analysis', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const filterType = c.req.query('filter_type') // 'class', 'grade', or 'school'
    const gradeLevel = c.req.query('grade_level')
    const className = c.req.query('class_name')
    const db = c.env.DB
    
    // Base query for criteria analysis
    let query = `
      SELECT 
        ec.id as criteria_id,
        ec.title as criteria_title,
        ec.max_score,
        COUNT(e.id) as evaluation_count,
        AVG(e.score) as average_score,
        MIN(e.score) as min_score,
        MAX(e.score) as max_score,
        (AVG(e.score) / ec.max_score * 100) as percentage
      FROM evaluation_criteria ec
      LEFT JOIN evaluations e ON ec.id = e.criteria_id AND e.teacher_id = ? AND e.academic_year = '2025'
    `
    
    const bindings: any[] = [teacherId]
    
    // Add filter conditions
    if (filterType === 'class' && gradeLevel && className) {
      query += ` AND e.grade_level = ? AND e.class_name = ?`
      bindings.push(gradeLevel, className)
    } else if (filterType === 'grade' && gradeLevel) {
      query += ` AND e.grade_level = ?`
      bindings.push(gradeLevel)
    }
    // 'school' means no additional filters
    
    query += `
      WHERE ec.is_active = 1
      GROUP BY ec.id, ec.title, ec.max_score
      HAVING evaluation_count > 0
      ORDER BY percentage DESC
    `
    
    let criteria
    if (bindings.length === 1) {
      criteria = await db.prepare(query).bind(bindings[0]).all()
    } else if (bindings.length === 2) {
      criteria = await db.prepare(query).bind(bindings[0], bindings[1]).all()
    } else if (bindings.length === 3) {
      criteria = await db.prepare(query).bind(bindings[0], bindings[1], bindings[2]).all()
    } else {
      criteria = await db.prepare(query).all()
    }
    
    // Calculate strengths (top 3) and weaknesses (bottom 3)
    const results = criteria.results as any[]
    const strengths = results.slice(0, 3)
    const weaknesses = results.slice(-3).reverse()
    
    // Get filter info
    let filterInfo = { type: filterType || 'school' }
    if (filterType === 'class') {
      filterInfo = { ...filterInfo, grade_level: gradeLevel, class_name: className }
    } else if (filterType === 'grade') {
      filterInfo = { ...filterInfo, grade_level: gradeLevel }
    }
    
    return c.json({
      success: true,
      filter: filterInfo,
      strengths,
      weaknesses,
      all_criteria: results
    })
  } catch (error) {
    console.error('Error analyzing teacher:', error)
    return c.json({ success: false, message: 'حدث خطأ في تحليل المعلم' }, 500)
  }
})

// ============================================
// Custom Criteria APIs
// ============================================

// Get teacher custom criteria
app.get('/api/admin/teachers/:id/custom-criteria', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const db = c.env.DB
    
    const criteria = await db
      .prepare(`
        SELECT 
          ec.id,
          ec.title,
          ec.description,
          ec.max_score,
          ec.display_order,
          ec.is_active,
          tc.teacher_id
        FROM evaluation_criteria ec
        LEFT JOIN teacher_custom_criteria tc ON ec.id = tc.criteria_id AND tc.teacher_id = ?
        WHERE ec.is_active = 1
        ORDER BY ec.display_order
      `)
      .bind(teacherId)
      .all()
    
    return c.json({ success: true, criteria: criteria.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب المعايير المخصصة' }, 500)
  }
})

// Add custom criteria to teacher
app.post('/api/admin/teachers/:id/custom-criteria', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const { criteria_ids } = await c.req.json()
    const db = c.env.DB
    
    // Delete existing custom criteria
    await db
      .prepare('DELETE FROM teacher_custom_criteria WHERE teacher_id = ?')
      .bind(teacherId)
      .run()
    
    // Add new custom criteria
    for (const criteriaId of criteria_ids) {
      await db
        .prepare('INSERT INTO teacher_custom_criteria (teacher_id, criteria_id) VALUES (?, ?)')
        .bind(teacherId, criteriaId)
        .run()
    }
    
    return c.json({ success: true, message: 'تم تحديث المعايير المخصصة بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث المعايير المخصصة' }, 500)
  }
})

// Get criteria for evaluation (general + custom for teacher)
app.get('/api/evaluation/criteria/:teacherId', async (c) => {
  try {
    const teacherId = c.req.param('teacherId')
    const db = c.env.DB
    
    // Check if teacher has custom criteria
    const customCriteria = await db
      .prepare(`
        SELECT COUNT(*) as count
        FROM teacher_custom_criteria
        WHERE teacher_id = ?
      `)
      .bind(teacherId)
      .first()
    
    let criteria
    
    if (customCriteria && (customCriteria as any).count > 0) {
      // Get custom criteria for this teacher
      criteria = await db
        .prepare(`
          SELECT ec.*
          FROM evaluation_criteria ec
          JOIN teacher_custom_criteria tc ON ec.id = tc.criteria_id
          WHERE tc.teacher_id = ? AND ec.is_active = 1
          ORDER BY ec.display_order
        `)
        .bind(teacherId)
        .all()
    } else {
      // Get general criteria
      criteria = await db
        .prepare(`
          SELECT * FROM evaluation_criteria
          WHERE is_active = 1
          ORDER BY display_order
        `)
        .all()
    }
    
    return c.json({ success: true, criteria: criteria.results })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب معايير التقييم' }, 500)
  }
})

// Get settings
app.get('/api/settings', async (c) => {
  try {
    const db = c.env.DB
    const settings = await db.prepare('SELECT * FROM settings').all()
    
    // First, get values from database
    const settingsObj: Record<string, string> = {}
    settings.results.forEach((setting: any) => {
      settingsObj[setting.setting_key] = setting.setting_value
    })
    
    // Then, apply defaults for missing values (will override school_name)
    const defaults = {
      school_name: 'متوسطة آفاق المنصورة الأهلية',
      school_logo: '/static/images/logo.png',
      academic_year: '2025',
      evaluation_enabled: 'true',
      min_evaluations: '5'
    }
    
    // Override school_name with our new name
    settingsObj.school_name = defaults.school_name
    
    // Fill in any missing values
    Object.keys(defaults).forEach(key => {
      if (!settingsObj[key]) {
        settingsObj[key] = defaults[key as keyof typeof defaults]
      }
    })

    return c.json({ success: true, settings: settingsObj })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في جلب الإعدادات' }, 500)
  }
})

// Update settings (admin only)
app.post('/api/admin/settings', async (c) => {
  try {
    const { school_name } = await c.req.json()
    const db = c.env.DB
    
    if (school_name) {
      await db
        .prepare('UPDATE settings SET setting_value = ? WHERE setting_key = ?')
        .bind(school_name, 'school_name')
        .run()
    }
    
    return c.json({ success: true, message: 'تم تحديث الإعدادات بنجاح' })
  } catch (error) {
    return c.json({ success: false, message: 'حدث خطأ في تحديث الإعدادات' }, 500)
  }
})

// ============================================
// Main HTML Page
// ============================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>معلمي 2025 - نظام تقييم المعلمين</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/css/styles.css" rel="stylesheet">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
      
      * {
        font-family: 'Tajawal', sans-serif;
      }
      
      body {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }
      
      .icon-3d {
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
        transition: transform 0.3s ease;
      }
      
      .icon-3d:hover {
        transform: translateY(-5px) scale(1.05);
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transition: all 0.3s ease;
      }
      
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
      }
      
      .rating-star {
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 2.5rem;
      }
      
      .rating-star:hover,
      .rating-star.active {
        color: #fbbf24;
        transform: scale(1.1);
      }
      
      .fade-in {
        animation: fadeIn 0.5s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .slide-in {
        animation: slideIn 0.5s ease-out;
      }
      
      @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
</head>
<body>
    <div id="app" class="min-h-screen py-8 px-4"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
    <script src="/static/js/pdf-export.js?v=6.0"></script>
    <script src="/static/js/excel-handler.js?v=6.0"></script>
    <script src="/static/js/app.js?v=6.0"></script>
</body>
</html>
  `)
})

// ==========================================
// Evaluation Management APIs
// ==========================================

// Get all evaluations for a student (for admin management)
app.get('/api/admin/students/:id/all-evaluations', async (c) => {
  try {
    const studentId = c.req.param('id')
    const db = c.env.DB
    
    const evaluations = await db
      .prepare(`
        SELECT 
          e.id,
          e.teacher_id,
          u.full_name as teacher_name,
          u.subject,
          e.criteria_id,
          ec.title as criteria_title,
          e.score,
          e.academic_year
        FROM evaluations e
        LEFT JOIN users u ON e.teacher_id = u.id
        LEFT JOIN evaluation_criteria ec ON e.criteria_id = ec.id
        WHERE e.student_id = ?
        ORDER BY u.full_name, ec.title
      `)
      .bind(studentId)
      .all()
    
    return c.json({ success: true, evaluations: evaluations.results || [] })
  } catch (error) {
    console.error('Error fetching student evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب التقييمات' }, 500)
  }
})

// Get all evaluations for a teacher (for admin management)
app.get('/api/admin/teachers/:id/all-evaluations', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const db = c.env.DB
    
    const evaluations = await db
      .prepare(`
        SELECT 
          e.id,
          e.student_id,
          u.full_name as student_name,
          u.grade_level,
          u.class_name,
          e.criteria_id,
          ec.title as criteria_title,
          e.score,
          e.academic_year
        FROM evaluations e
        LEFT JOIN users u ON e.student_id = u.id
        LEFT JOIN evaluation_criteria ec ON e.criteria_id = ec.id
        WHERE e.teacher_id = ?
        ORDER BY u.full_name, ec.title
      `)
      .bind(teacherId)
      .all()
    
    return c.json({ success: true, evaluations: evaluations.results || [] })
  } catch (error) {
    console.error('Error fetching teacher evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب التقييمات' }, 500)
  }
})

// Delete all evaluations for a student
app.delete('/api/admin/students/:id/evaluations', async (c) => {
  try {
    const studentId = c.req.param('id')
    const db = c.env.DB
    
    // Get count first
    const count = await db
      .prepare('SELECT COUNT(*) as count FROM evaluations WHERE student_id = ?')
      .bind(studentId)
      .first()
    
    // Delete evaluations
    await db
      .prepare('DELETE FROM evaluations WHERE student_id = ?')
      .bind(studentId)
      .run()
    
    // Delete evaluation status
    await db
      .prepare('DELETE FROM evaluation_status WHERE student_id = ?')
      .bind(studentId)
      .run()
    
    return c.json({ 
      success: true, 
      message: `تم حذف ${count.count} تقييم بنجاح`,
      deletedCount: count.count
    })
  } catch (error) {
    console.error('Error deleting student evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف التقييمات' }, 500)
  }
})

// Delete all evaluations for a teacher
app.delete('/api/admin/teachers/:id/evaluations', async (c) => {
  try {
    const teacherId = c.req.param('id')
    const db = c.env.DB
    
    // Get count first
    const count = await db
      .prepare('SELECT COUNT(*) as count FROM evaluations WHERE teacher_id = ?')
      .bind(teacherId)
      .first()
    
    // Delete evaluations
    await db
      .prepare('DELETE FROM evaluations WHERE teacher_id = ?')
      .bind(teacherId)
      .run()
    
    // Delete evaluation status
    await db
      .prepare('DELETE FROM evaluation_status WHERE teacher_id = ?')
      .bind(teacherId)
      .run()
    
    return c.json({ 
      success: true, 
      message: `تم حذف ${count.count} تقييم بنجاح`,
      deletedCount: count.count
    })
  } catch (error) {
    console.error('Error deleting teacher evaluations:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف التقييمات' }, 500)
  }
})

// ==========================================
// Bulk Student Deletion APIs
// ==========================================

// Get list of all classes (فصول) grouped by grade
app.get('/api/admin/students/classes/list', async (c) => {
  try {
    const db = c.env.DB
    
    const classes = await db
      .prepare(`
        SELECT DISTINCT grade_level, class_name, 
               COUNT(*) as student_count
        FROM users 
        WHERE user_type = 'student'
        GROUP BY grade_level, class_name
        ORDER BY grade_level, class_name
      `)
      .all()
    
    return c.json({ success: true, classes: classes.results || [] })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب الفصول' }, 500)
  }
})

// Get list of all grades (صفوف)
app.get('/api/admin/students/grades/list', async (c) => {
  try {
    const db = c.env.DB
    
    const grades = await db
      .prepare(`
        SELECT grade_level, COUNT(*) as student_count
        FROM users 
        WHERE user_type = 'student'
        GROUP BY grade_level
        ORDER BY grade_level
      `)
      .all()
    
    return c.json({ success: true, grades: grades.results || [] })
  } catch (error) {
    console.error('Error fetching grades:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب الصفوف' }, 500)
  }
})

// Delete all students in a specific class (فصل)
app.delete('/api/admin/students/class/:gradeLevel/:className', async (c) => {
  try {
    const gradeLevel = c.req.param('gradeLevel')
    const className = c.req.param('className')
    const db = c.env.DB
    
    // Get student IDs in this class
    const students = await db
      .prepare(`
        SELECT id FROM users 
        WHERE user_type = 'student' 
        AND grade_level = ? 
        AND class_name = ?
      `)
      .bind(gradeLevel, className)
      .all()
    
    const studentIds = students.results.map(s => s.id)
    
    if (studentIds.length === 0) {
      return c.json({ 
        success: false, 
        message: 'لا توجد طلاب في هذا الفصل' 
      }, 404)
    }
    
    // Delete evaluations for these students
    for (const id of studentIds) {
      await db
        .prepare('DELETE FROM evaluations WHERE student_id = ?')
        .bind(id)
        .run()
      
      await db
        .prepare('DELETE FROM evaluation_status WHERE student_id = ?')
        .bind(id)
        .run()
    }
    
    // Delete students
    await db
      .prepare(`
        DELETE FROM users 
        WHERE user_type = 'student' 
        AND grade_level = ? 
        AND class_name = ?
      `)
      .bind(gradeLevel, className)
      .run()
    
    return c.json({ 
      success: true, 
      message: `تم حذف ${studentIds.length} طالب من ${gradeLevel} - ${className}`,
      deletedCount: studentIds.length
    })
  } catch (error) {
    console.error('Error deleting class students:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف طلاب الفصل' }, 500)
  }
})

// Delete all students in a specific grade (صف)
app.delete('/api/admin/students/grade/:gradeLevel', async (c) => {
  try {
    const gradeLevel = c.req.param('gradeLevel')
    const db = c.env.DB
    
    // Get student IDs in this grade
    const students = await db
      .prepare(`
        SELECT id FROM users 
        WHERE user_type = 'student' 
        AND grade_level = ?
      `)
      .bind(gradeLevel)
      .all()
    
    const studentIds = students.results.map(s => s.id)
    
    if (studentIds.length === 0) {
      return c.json({ 
        success: false, 
        message: 'لا توجد طلاب في هذا الصف' 
      }, 404)
    }
    
    // Delete evaluations for these students
    for (const id of studentIds) {
      await db
        .prepare('DELETE FROM evaluations WHERE student_id = ?')
        .bind(id)
        .run()
      
      await db
        .prepare('DELETE FROM evaluation_status WHERE student_id = ?')
        .bind(id)
        .run()
    }
    
    // Delete students
    await db
      .prepare(`
        DELETE FROM users 
        WHERE user_type = 'student' 
        AND grade_level = ?
      `)
      .bind(gradeLevel)
      .run()
    
    return c.json({ 
      success: true, 
      message: `تم حذف ${studentIds.length} طالب من ${gradeLevel}`,
      deletedCount: studentIds.length
    })
  } catch (error) {
    console.error('Error deleting grade students:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف طلاب الصف' }, 500)
  }
})

// ============================================
// Admin Users Management APIs
// ============================================

// Get all admin users
app.get('/api/admin/users/admins', async (c) => {
  try {
    const db = c.env.DB
    
    const result = await db
      .prepare(`
        SELECT u.id, u.username, u.full_name, u.email, u.phone, 
               COALESCE(ar.role, 'admin') as user_type, u.created_at
        FROM users u
        LEFT JOIN admin_roles ar ON u.id = ar.user_id
        WHERE u.user_type = 'admin'
        ORDER BY u.created_at DESC
      `)
      .all()
    
    return c.json({ success: true, admins: result.results })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return c.json({ success: false, message: 'حدث خطأ في جلب المستخدمين الإداريين' }, 500)
  }
})

// Add new admin user
app.post('/api/admin/users/admins', async (c) => {
  try {
    const { username, password, full_name, email, phone, user_type } = await c.req.json()
    const db = c.env.DB
    
    // Validate role (not user_type anymore)
    const validRoles = ['admin', 'principal', 'supervisor', 'manager']
    if (!validRoles.includes(user_type)) {
      return c.json({ 
        success: false, 
        message: 'نوع المستخدم غير صحيح' 
      }, 400)
    }
    
    // Check if username exists
    const existing = await db
      .prepare('SELECT id FROM users WHERE username = ?')
      .bind(username)
      .first()
    
    if (existing) {
      return c.json({ success: false, message: 'اسم المستخدم موجود بالفعل' }, 400)
    }
    
    // Hash password (simple hash - in production use bcrypt)
    const hashedPassword = password // TODO: Add proper password hashing
    
    // Insert user with user_type='admin' (to satisfy CHECK constraint)
    const insertResult = await db
      .prepare(`
        INSERT INTO users (username, password, full_name, email, phone, user_type)
        VALUES (?, ?, ?, ?, ?, 'admin')
      `)
      .bind(username, hashedPassword, full_name, email || null, phone || null)
      .run()
    
    // Get the new user ID
    const newUserId = insertResult.meta.last_row_id
    
    // Insert role in admin_roles table
    await db
      .prepare(`
        INSERT INTO admin_roles (user_id, role, assigned_by)
        VALUES (?, ?, 1)
      `)
      .bind(newUserId, user_type)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم إضافة المستخدم الإداري بنجاح' 
    })
  } catch (error) {
    console.error('Error adding admin user:', error)
    return c.json({ success: false, message: 'حدث خطأ في إضافة المستخدم الإداري' }, 500)
  }
})

// Update admin user
app.put('/api/admin/users/admins/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const { full_name, email, phone, user_type, password } = await c.req.json()
    const db = c.env.DB
    
    // Validate user_type if provided
    if (user_type) {
      const validTypes = ['admin', 'principal', 'supervisor', 'manager']
      if (!validTypes.includes(user_type)) {
        return c.json({ 
          success: false, 
          message: 'نوع المستخدم غير صحيح' 
        }, 400)
      }
    }
    
    // Build update query
    let query = 'UPDATE users SET full_name = ?, email = ?, phone = ?, user_type = ?'
    let params = [full_name, email || null, phone || null, user_type]
    
    // Add password update if provided
    if (password && password.trim() !== '') {
      query += ', password = ?'
      params.push(password) // TODO: Add proper password hashing
    }
    
    query += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    params.push(userId)
    
    await db
      .prepare(query)
      .bind(...params)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم تحديث بيانات المستخدم بنجاح' 
    })
  } catch (error) {
    console.error('Error updating admin user:', error)
    return c.json({ success: false, message: 'حدث خطأ في تحديث المستخدم' }, 500)
  }
})

// Delete admin user
app.delete('/api/admin/users/admins/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const db = c.env.DB
    
    // Prevent deleting the main admin (id = 1)
    if (userId === '1') {
      return c.json({ 
        success: false, 
        message: 'لا يمكن حذف المدير الرئيسي' 
      }, 403)
    }
    
    await db
      .prepare('DELETE FROM users WHERE id = ? AND user_type != ?')
      .bind(userId, 'student')
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم حذف المستخدم الإداري بنجاح' 
    })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return c.json({ success: false, message: 'حدث خطأ في حذف المستخدم' }, 500)
  }
})

// ============================================
// PERMISSIONS MANAGEMENT APIs
// ============================================

// Get all permissions
app.get('/api/admin/permissions', async (c) => {
  try {
    const db = c.env.DB
    
    const result = await db
      .prepare(`
        SELECT * FROM permissions 
        ORDER BY category, display_order, permission_name_ar
      `)
      .all()
    
    return c.json({ success: true, permissions: result.results })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return c.json({ success: false, message: 'خطأ في جلب الصلاحيات' }, 500)
  }
})

// Get user permissions
app.get('/api/admin/users/:id/permissions', async (c) => {
  try {
    const userId = c.req.param('id')
    const db = c.env.DB
    
    const result = await db
      .prepare(`
        SELECT p.*, up.granted_at, up.granted_by,
               u.full_name as granted_by_name
        FROM user_permissions up
        JOIN permissions p ON up.permission_key = p.permission_key
        LEFT JOIN users u ON up.granted_by = u.id
        WHERE up.user_id = ?
        ORDER BY p.category, p.permission_name_ar
      `)
      .bind(userId)
      .all()
    
    return c.json({ success: true, permissions: result.results })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return c.json({ success: false, message: 'خطأ في جلب صلاحيات المستخدم' }, 500)
  }
})

// Grant permission to user
app.post('/api/admin/users/:id/permissions', async (c) => {
  try {
    const userId = c.req.param('id')
    const { permission_key, granted_by } = await c.req.json()
    const db = c.env.DB
    
    // Check if permission exists
    const permCheck = await db
      .prepare('SELECT id FROM permissions WHERE permission_key = ?')
      .bind(permission_key)
      .first()
    
    if (!permCheck) {
      return c.json({ success: false, message: 'الصلاحية غير موجودة' }, 404)
    }
    
    // Grant permission
    await db
      .prepare(`
        INSERT OR IGNORE INTO user_permissions (user_id, permission_key, granted_by)
        VALUES (?, ?, ?)
      `)
      .bind(userId, permission_key, granted_by)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم منح الصلاحية بنجاح' 
    })
  } catch (error) {
    console.error('Error granting permission:', error)
    return c.json({ success: false, message: 'خطأ في منح الصلاحية' }, 500)
  }
})

// Revoke permission from user
app.delete('/api/admin/users/:id/permissions/:key', async (c) => {
  try {
    const userId = c.req.param('id')
    const permissionKey = c.req.param('key')
    const db = c.env.DB
    
    await db
      .prepare('DELETE FROM user_permissions WHERE user_id = ? AND permission_key = ?')
      .bind(userId, permissionKey)
      .run()
    
    return c.json({ 
      success: true, 
      message: 'تم إلغاء الصلاحية بنجاح' 
    })
  } catch (error) {
    console.error('Error revoking permission:', error)
    return c.json({ success: false, message: 'خطأ في إلغاء الصلاحية' }, 500)
  }
})

// Batch update user permissions
app.put('/api/admin/users/:id/permissions', async (c) => {
  try {
    const userId = c.req.param('id')
    const { permissions, granted_by } = await c.req.json()
    const db = c.env.DB
    
    // Delete all existing permissions
    await db
      .prepare('DELETE FROM user_permissions WHERE user_id = ?')
      .bind(userId)
      .run()
    
    // Insert new permissions
    if (permissions && permissions.length > 0) {
      const insertStmt = db.prepare(`
        INSERT INTO user_permissions (user_id, permission_key, granted_by)
        VALUES (?, ?, ?)
      `)
      
      const batch = permissions.map((perm: string) => 
        insertStmt.bind(userId, perm, granted_by)
      )
      
      await db.batch(batch)
    }
    
    return c.json({ 
      success: true, 
      message: 'تم تحديث الصلاحيات بنجاح' 
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return c.json({ success: false, message: 'خطأ في تحديث الصلاحيات' }, 500)
  }
})

// Check if user has specific permission
app.get('/api/admin/users/:id/permissions/check/:key', async (c) => {
  try {
    const userId = c.req.param('id')
    const permissionKey = c.req.param('key')
    const db = c.env.DB
    
    // Check if user is main admin (id = 1) - has all permissions
    if (userId === '1') {
      return c.json({ success: true, has_permission: true })
    }
    
    const result = await db
      .prepare('SELECT id FROM user_permissions WHERE user_id = ? AND permission_key = ?')
      .bind(userId, permissionKey)
      .first()
    
    return c.json({ 
      success: true, 
      has_permission: !!result 
    })
  } catch (error) {
    console.error('Error checking permission:', error)
    return c.json({ success: false, message: 'خطأ في التحقق من الصلاحية' }, 500)
  }
})

// ============================================
// BACKUP & RESTORE APIs
// ============================================

// Get all database data as JSON backup
app.get('/api/admin/backup/export', async (c) => {
  try {
    const db = c.env.DB
    
    // Export all tables
    const backup = {
      version: '6.3',
      timestamp: new Date().toISOString(),
      data: {
        users: (await db.prepare('SELECT * FROM users').all()).results,
        teachers: (await db.prepare('SELECT * FROM teachers').all()).results,
        teacher_classes: (await db.prepare('SELECT * FROM teacher_classes').all()).results,
        evaluation_criteria: (await db.prepare('SELECT * FROM evaluation_criteria').all()).results,
        teacher_custom_criteria: (await db.prepare('SELECT * FROM teacher_custom_criteria').all()).results,
        evaluations: (await db.prepare('SELECT * FROM evaluations').all()).results,
        evaluation_status: (await db.prepare('SELECT * FROM evaluation_status').all()).results,
        settings: (await db.prepare('SELECT * FROM settings').all()).results,
        user_activity_log: (await db.prepare('SELECT * FROM user_activity_log WHERE created_at > datetime("now", "-30 days")').all()).results,
        permissions: (await db.prepare('SELECT * FROM permissions').all()).results,
        user_permissions: (await db.prepare('SELECT * FROM user_permissions').all()).results,
        classes: (await db.prepare('SELECT * FROM classes').all()).results,
        user_classes: (await db.prepare('SELECT * FROM user_classes').all()).results
      }
    }
    
    // Calculate statistics
    const stats = {
      users: backup.data.users.length,
      students: backup.data.users.filter((u: any) => u.user_type === 'student').length,
      admins: backup.data.users.filter((u: any) => u.user_type !== 'student').length,
      teachers: backup.data.teachers.length,
      evaluations: backup.data.evaluations.length,
      criteria: backup.data.evaluation_criteria.length
    }
    
    return c.json({ 
      success: true, 
      backup,
      stats,
      filename: `afaq-backup-${new Date().toISOString().split('T')[0]}.json`
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return c.json({ success: false, message: 'خطأ في إنشاء النسخة الاحتياطية' }, 500)
  }
})

// List available Time Travel bookmarks
app.get('/api/admin/backup/bookmarks', async (c) => {
  try {
    // This would require wrangler CLI access which isn't available in Workers
    // Instead, we'll return instructions
    return c.json({ 
      success: true,
      message: 'استخدم wrangler CLI لعرض نقاط الاستعادة',
      command: 'npx wrangler d1 time-travel info afaq-almansourah-db',
      note: 'يمكن استعادة البيانات حتى 30 يوم للوراء'
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطأ في جلب نقاط الاستعادة' }, 500)
  }
})

export default app
