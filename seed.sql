-- إدراج المستخدم الإداري الافتراضي
INSERT OR IGNORE INTO users (username, password, full_name, user_type, email) 
VALUES ('admin', 'admin123', 'مدير النظام', 'admin', 'admin@school.edu.sa');

-- إدراج معايير التقييم الأساسية الستة
INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order, is_active) VALUES
(1, 'مدى الاستيعاب', 'قدرة المعلم على إيصال المعلومات بشكل واضح وسهل الفهم', 10, 1, 1),
(2, 'طريقة الشرح', 'فعالية أسلوب التدريس والتوضيح', 10, 2, 1),
(3, 'الاهتمام بتصحيح الواجبات', 'مدى متابعة وتصحيح الواجبات المدرسية', 10, 3, 1),
(4, 'عدم تضييع وقت الحصة', 'استثمار وقت الحصة بشكل فعال', 10, 4, 1),
(5, 'مراعاة ظروف الطلاب', 'التعامل مع الطلاب بمرونة وتفهم', 10, 5, 1),
(6, 'توصيل المعلومات', 'وضوح وفعالية إيصال المعلومات للطلاب', 10, 6, 1);

-- إدراج معلمين تجريبيين
INSERT OR IGNORE INTO teachers (id, full_name, subject, specialization, employee_id, gender) VALUES
(1, 'أحمد محمد السالم', 'رياضيات', 'رياضيات', 'T001', 'male'),
(2, 'فاطمة عبدالله الغامدي', 'لغة عربية', 'لغة عربية', 'T002', 'female'),
(3, 'خالد عبدالعزيز القحطاني', 'علوم', 'فيزياء', 'T003', 'male'),
(4, 'نورة سعد الشهري', 'لغة إنجليزية', 'لغة إنجليزية', 'T004', 'female'),
(5, 'محمد علي الحربي', 'تربية إسلامية', 'شريعة', 'T005', 'male');

-- ربط المعلمين بالفصول (متوسط أول - فصل أ)
INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES
(1, 'متوسط أول', '1أ', 'رياضيات'),
(2, 'متوسط أول', '1أ', 'لغة عربية'),
(3, 'متوسط أول', '1أ', 'علوم'),
(4, 'متوسط أول', '1أ', 'لغة إنجليزية'),
(5, 'متوسط أول', '1أ', 'تربية إسلامية');

-- ربط المعلمين بالفصول (متوسط أول - فصل ب)
INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES
(1, 'متوسط أول', '1ب', 'رياضيات'),
(2, 'متوسط أول', '1ب', 'لغة عربية'),
(3, 'متوسط أول', '1ب', 'علوم'),
(4, 'متوسط أول', '1ب', 'لغة إنجليزية'),
(5, 'متوسط أول', '1ب', 'تربية إسلامية');

-- إدراج طلاب تجريبيين (متوسط أول - فصل أ)
INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES
('student1', 'pass123', 'عبدالرحمن أحمد الزهراني', 'student', 'متوسط أول', '1أ', 'S1001', 'male'),
('student2', 'pass123', 'عمر محمد العمري', 'student', 'متوسط أول', '1أ', 'S1002', 'male'),
('student3', 'pass123', 'فيصل خالد المطيري', 'student', 'متوسط أول', '1أ', 'S1003', 'male'),
('student4', 'pass123', 'سارة علي السبيعي', 'student', 'متوسط أول', '1أ', 'S1004', 'female'),
('student5', 'pass123', 'مريم سعد الدوسري', 'student', 'متوسط أول', '1أ', 'S1005', 'female');

-- إدراج طلاب تجريبيين (متوسط أول - فصل ب)
INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES
('student6', 'pass123', 'يوسف فهد الشمري', 'student', 'متوسط أول', '1ب', 'S1006', 'male'),
('student7', 'pass123', 'منصور ناصر القرني', 'student', 'متوسط أول', '1ب', 'S1007', 'male'),
('student8', 'pass123', 'لمى عبدالله الحربي', 'student', 'متوسط أول', '1ب', 'S1008', 'female'),
('student9', 'pass123', 'ريم محمد الغامدي', 'student', 'متوسط أول', '1ب', 'S1009', 'female'),
('student10', 'pass123', 'نواف عبدالعزيز العتيبي', 'student', 'متوسط أول', '1ب', 'S1010', 'male');

-- إدراج إعدادات النظام
INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES
('school_name', 'مدرسة النموذجية المتوسطة', 'اسم المؤسسة التعليمية'),
('school_logo', '/static/images/logo.png', 'شعار المؤسسة التعليمية'),
('academic_year', '2025', 'السنة الأكاديمية الحالية'),
('evaluation_enabled', 'true', 'تفعيل نظام التقييم'),
('min_evaluations', '5', 'الحد الأدنى لعدد التقييمات لظهور النتائج');
