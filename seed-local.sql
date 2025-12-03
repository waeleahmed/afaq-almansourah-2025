-- Seed data for local development

-- Add evaluation criteria
INSERT OR IGNORE INTO evaluation_criteria (id, title, description, max_score, display_order) VALUES
(1, 'الانضباط والالتزام بالحضور', 'مدى التزام المعلم بالحضور في الوقت المحدد والانضباط في العمل', 10, 1),
(2, 'التمكن من المادة العلمية', 'مستوى إتقان المعلم للمادة الدراسية وقدرته على توصيل المعلومات', 10, 2),
(3, 'طرق التدريس والشرح', 'استخدام أساليب تدريس متنوعة وفعّالة في توصيل المعلومات', 10, 3),
(4, 'التعامل مع الطلاب', 'أسلوب المعلم في التعامل مع الطلاب واحترامهم', 10, 4),
(5, 'التحفيز والتشجيع', 'قدرة المعلم على تحفيز الطلاب وتشجيعهم على التعلم', 10, 5),
(6, 'العدل والإنصاف', 'مدى عدالة المعلم في التعامل مع جميع الطلاب', 10, 6);

-- Add admin user
INSERT OR IGNORE INTO users (id, username, password, full_name, user_type) VALUES
(1, 'admin', 'admin123', 'المدير', 'admin');

-- Add settings
INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES
('school_name', 'متوسطة آفاق المنصورة الأهلية'),
('school_logo', '/static/images/logo.png'),
('academic_year', '2025'),
('evaluation_enabled', 'true'),
('min_evaluations', '5');

-- Add sample students
INSERT OR IGNORE INTO users (username, password, full_name, user_type, grade_level, class_name, student_id, gender) VALUES
('student1', 'pass123', 'أحمد محمد علي', 'student', 'متوسط أول', '1أ', 'S001', 'male'),
('student2', 'pass123', 'محمد أحمد حسن', 'student', 'متوسط أول', '1أ', 'S002', 'male'),
('student3', 'pass123', 'علي سعد محمود', 'student', 'متوسط أول', '1أ', 'S003', 'male'),
('student4', 'pass123', 'خالد عبدالله سعيد', 'student', 'متوسط أول', '1أ', 'S004', 'male'),
('student5', 'pass123', 'سعد فهد عبدالعزيز', 'student', 'متوسط أول', '1أ', 'S005', 'male'),
('student6', 'pass123', 'فهد خالد أحمد', 'student', 'متوسط أول', '1ب', 'S006', 'male'),
('student7', 'pass123', 'عبدالله سالم محمد', 'student', 'متوسط أول', '1ب', 'S007', 'male'),
('student8', 'pass123', 'سالم عبدالله علي', 'student', 'متوسط أول', '1ب', 'S008', 'male'),
('student9', 'pass123', 'يوسف إبراهيم حسن', 'student', 'متوسط أول', '1ب', 'S009', 'male'),
('student10', 'pass123', 'إبراهيم يوسف سعد', 'student', 'متوسط أول', '1ب', 'S010', 'male');

-- Add sample teachers
INSERT OR IGNORE INTO teachers (full_name, subject, specialization, employee_id, gender) VALUES
('أ. محمد الأحمدي', 'رياضيات', 'تخصص رياضيات', 'T001', 'male'),
('أ. أحمد السعيد', 'لغة عربية', 'تخصص لغة عربية', 'T002', 'male'),
('أ. خالد المطيري', 'علوم', 'تخصص علوم', 'T003', 'male'),
('أ. عبدالله الشمري', 'اجتماعيات', 'تخصص اجتماعيات', 'T004', 'male'),
('أ. سعد العتيبي', 'إنجليزي', 'تخصص لغة إنجليزية', 'T005', 'male');

-- Assign teachers to classes
INSERT OR IGNORE INTO teacher_classes (teacher_id, grade_level, class_name, subject) VALUES
(1, 'متوسط أول', '1أ', 'رياضيات'),
(1, 'متوسط أول', '1ب', 'رياضيات'),
(2, 'متوسط أول', '1أ', 'لغة عربية'),
(2, 'متوسط أول', '1ب', 'لغة عربية'),
(3, 'متوسط أول', '1أ', 'علوم'),
(3, 'متوسط أول', '1ب', 'علوم'),
(4, 'متوسط أول', '1أ', 'اجتماعيات'),
(5, 'متوسط أول', '1أ', 'إنجليزي'),
(5, 'متوسط أول', '1ب', 'إنجليزي');
