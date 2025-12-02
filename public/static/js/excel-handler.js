// ============================================
// Excel Import/Export Handler
// نظام استيراد وتصدير ملفات Excel
// ============================================

class ExcelHandler {
  constructor() {
    this.schoolName = 'نظام تقييم المعلمين - معلمي 2025';
  }

  // Generate students Excel template - Real XLSX file
  generateStudentsTemplate() {
    try {
      // Create sample data
      const headers = ['الرقم الطلابي', 'الاسم الكامل', 'اسم المستخدم', 'كلمة المرور', 'الصف', 'الفصل', 'البريد الإلكتروني', 'رقم الهاتف', 'الجنس'];
      
      // Instructions sheet
      const instructionsData = [
        ['قالب رفع بيانات الطلاب - نظام معلمي 2025'],
        [],
        ['تعليمات الاستخدام:'],
        ['1. لا تقم بتغيير أسماء الأعمدة في صفحة "البيانات"'],
        ['2. الرقم الطلابي واسم المستخدم يجب أن يكونا فريدين (غير مكررين)'],
        ['3. كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
        ['4. الجنس: اكتب "ذكر" أو "أنثى" فقط'],
        ['5. يمكنك إضافة عدد غير محدود من الصفوف'],
        ['6. احفظ الملف بعد التعديل واذهب لصفحة رفع الملفات في النظام'],
        [],
        ['ملاحظات هامة:'],
        ['- الحقول المطلوبة: الرقم الطلابي، الاسم الكامل، اسم المستخدم، كلمة المرور، الصف، الفصل، الجنس'],
        ['- الحقول الاختيارية: البريد الإلكتروني، رقم الهاتف'],
        ['- تأكد من عدم ترك الحقول المطلوبة فارغة'],
      ];
      
      // Sample data
      const sampleData = [
        ['S2001', 'أحمد محمد السالم', 'student11', 'pass123', 'متوسط أول', '1أ', 'ahmad@school.sa', '0501234567', 'ذكر'],
        ['S2002', 'فاطمة علي الزهراني', 'student12', 'pass123', 'متوسط أول', '1أ', 'fatima@school.sa', '0501234568', 'أنثى'],
        ['S2003', 'محمد خالد العتيبي', 'student13', 'pass123', 'متوسط أول', '1ب', 'mohamed@school.sa', '0501234569', 'ذكر'],
        ['S2004', 'نورة سعد الشمري', 'student14', 'pass123', 'متوسط ثاني', '2أ', 'noura@school.sa', '0501234570', 'أنثى'],
        ['S2005', 'عبدالله عمر القحطاني', 'student15', 'pass123', 'متوسط ثاني', '2ب', 'abdullah@school.sa', '0501234571', 'ذكر']
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create instructions sheet
      const ws1 = XLSX.utils.aoa_to_sheet(instructionsData);
      ws1['!cols'] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws1, "التعليمات");

      // Create data sheet with headers + sample data
      const ws2 = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      ws2['!cols'] = [
        { wch: 15 },  // الرقم الطلابي
        { wch: 25 },  // الاسم الكامل
        { wch: 15 },  // اسم المستخدم
        { wch: 15 },  // كلمة المرور
        { wch: 15 },  // الصف
        { wch: 10 },  // الفصل
        { wch: 25 },  // البريد الإلكتروني
        { wch: 15 },  // رقم الهاتف
        { wch: 10 }   // الجنس
      ];

      XLSX.utils.book_append_sheet(wb, ws2, "البيانات");

      // Generate Excel file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Convert to blob
      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
      }

      const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `قالب_الطلاب_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('تم تحميل قالب Excel بنجاح!', 'يمكنك الآن فتحه وتعبئة البيانات');
    } catch (error) {
      console.error('Error generating students template:', error);
      toast.error('حدث خطأ في إنشاء القالب');
    }
  }

  // Generate teachers Excel template - Real XLSX file
  generateTeachersTemplate() {
    try {
      // Create sample data
      const headers = ['الرقم الوظيفي', 'الاسم الكامل', 'المادة', 'التخصص', 'البريد الإلكتروني', 'رقم الهاتف', 'الجنس'];
      
      // Instructions sheet
      const instructionsData = [
        ['قالب رفع بيانات المعلمين - نظام معلمي 2025'],
        [],
        ['تعليمات الاستخدام:'],
        ['1. لا تقم بتغيير أسماء الأعمدة في صفحة "البيانات"'],
        ['2. الرقم الوظيفي يجب أن يكون فريداً (غير مكرر)'],
        ['3. المادة والتخصص يجب أن يكونا واضحين'],
        ['4. الجنس: اكتب "ذكر" أو "أنثى" فقط'],
        ['5. يمكنك إضافة عدد غير محدود من الصفوف'],
        ['6. احفظ الملف بعد التعديل واذهب لصفحة رفع الملفات في النظام'],
        [],
        ['ملاحظات هامة:'],
        ['- الحقول المطلوبة: الرقم الوظيفي، الاسم الكامل، المادة، التخصص، الجنس'],
        ['- الحقول الاختيارية: البريد الإلكتروني، رقم الهاتف'],
        ['- تأكد من عدم ترك الحقول المطلوبة فارغة'],
      ];
      
      // Sample data
      const sampleData = [
        ['T101', 'عبدالله أحمد المالكي', 'رياضيات', 'رياضيات بحتة', 'abdullah@school.sa', '0501234570', 'ذكر'],
        ['T102', 'نورة محمد القحطاني', 'علوم', 'أحياء', 'nora@school.sa', '0501234571', 'أنثى'],
        ['T103', 'خالد سعد الغامدي', 'لغة عربية', 'لغة عربية', 'khalid@school.sa', '0501234572', 'ذكر'],
        ['T104', 'منى فهد الدوسري', 'لغة إنجليزية', 'لغويات', 'mona@school.sa', '0501234573', 'أنثى'],
        ['T105', 'سعد علي العتيبي', 'تربية إسلامية', 'شريعة', 'saad@school.sa', '0501234574', 'ذكر']
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create instructions sheet
      const ws1 = XLSX.utils.aoa_to_sheet(instructionsData);
      ws1['!cols'] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws1, "التعليمات");

      // Create data sheet with headers + sample data
      const ws2 = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      ws2['!cols'] = [
        { wch: 15 },  // الرقم الوظيفي
        { wch: 25 },  // الاسم الكامل
        { wch: 15 },  // المادة
        { wch: 20 },  // التخصص
        { wch: 25 },  // البريد الإلكتروني
        { wch: 15 },  // رقم الهاتف
        { wch: 10 }   // الجنس
      ];

      XLSX.utils.book_append_sheet(wb, ws2, "البيانات");

      // Generate Excel file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Convert to blob
      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
      }

      const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `قالب_المعلمين_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('تم تحميل قالب Excel بنجاح!', 'يمكنك الآن فتحه وتعبئة البيانات');
    } catch (error) {
      console.error('Error generating teachers template:', error);
      toast.error('حدث خطأ في إنشاء القالب');
    }
  }

  // Parse Excel file using SheetJS (xlsx)
  async parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet (البيانات or data sheet)
          let sheetName = workbook.SheetNames.find(name => name === 'البيانات') || workbook.SheetNames[0];
          if (workbook.SheetNames.length > 1 && workbook.SheetNames[1]) {
            sheetName = workbook.SheetNames[1]; // Use second sheet if available (البيانات)
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Upload students from Excel
  async uploadStudents(file) {
    try {
      toast.info('جاري معالجة الملف...', 'يرجى الانتظار');

      // Parse Excel file
      const data = await this.parseExcelFile(file);
      
      if (!data || data.length === 0) {
        toast.error('الملف فارغ أو غير صحيح');
        return;
      }

      // Validate and prepare data
      const students = data.map((row, index) => {
        // Check required fields
        if (!row['الرقم الطلابي'] || !row['الاسم الكامل'] || !row['اسم المستخدم'] || 
            !row['كلمة المرور'] || !row['الصف'] || !row['الفصل']) {
          throw new Error(`الصف ${index + 2}: بيانات ناقصة`);
        }

        return {
          student_id: row['الرقم الطلابي'],
          full_name: row['الاسم الكامل'],
          username: row['اسم المستخدم'],
          password: row['كلمة المرور'],
          grade_level: row['الصف'],
          class_name: row['الفصل'],
          email: row['البريد الإلكتروني'] || null,
          phone: row['رقم الهاتف'] || null,
          gender: row['الجنس'] || null
        };
      });

      // Send to server
      const response = await axios.post('/api/admin/students/bulk-upload', { students });
      
      if (response.data.success) {
        toast.success(`تم رفع ${response.data.inserted} طالب بنجاح`);
        if (response.data.skipped > 0) {
          toast.warning(`تم تخطي ${response.data.skipped} طالب (مكررين)`);
        }
        return response.data;
      } else {
        toast.error(response.data.message || 'فشل في رفع البيانات');
        return null;
      }
    } catch (error) {
      console.error('Error uploading students:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة الملف');
      return null;
    }
  }

  // Upload teachers from Excel
  async uploadTeachers(file) {
    try {
      toast.info('جاري معالجة الملف...', 'يرجى الانتظار');

      // Parse Excel file
      const data = await this.parseExcelFile(file);
      
      if (!data || data.length === 0) {
        toast.error('الملف فارغ أو غير صحيح');
        return;
      }

      // Validate and prepare data
      const teachers = data.map((row, index) => {
        // Check required fields
        if (!row['الرقم الوظيفي'] || !row['الاسم الكامل'] || !row['المادة'] || !row['التخصص']) {
          throw new Error(`الصف ${index + 2}: بيانات ناقصة`);
        }

        return {
          employee_id: row['الرقم الوظيفي'],
          full_name: row['الاسم الكامل'],
          subject: row['المادة'],
          specialization: row['التخصص'],
          email: row['البريد الإلكتروني'] || null,
          phone: row['رقم الهاتف'] || null,
          gender: row['الجنس'] || null
        };
      });

      // Send to server
      const response = await axios.post('/api/admin/teachers/bulk-upload', { teachers });
      
      if (response.data.success) {
        toast.success(`تم رفع ${response.data.inserted} معلم بنجاح`);
        if (response.data.skipped > 0) {
          toast.warning(`تم تخطي ${response.data.skipped} معلم (مكررين)`);
        }
        return response.data;
      } else {
        toast.error(response.data.message || 'فشل في رفع البيانات');
        return null;
      }
    } catch (error) {
      console.error('Error uploading teachers:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة الملف');
      return null;
    }
  }
}

// Create global instance
const excelHandler = new ExcelHandler();
