// ============================================
// Excel Import/Export Handler
// نظام استيراد وتصدير ملفات Excel
// ============================================

class ExcelHandler {
  constructor() {
    this.schoolName = 'نظام تقييم المعلمين - معلمي 2025';
  }

  // Generate students Excel template
  generateStudentsTemplate() {
    // Create sample data
    const headers = ['الرقم الطلابي', 'الاسم الكامل', 'اسم المستخدم', 'كلمة المرور', 'الصف', 'الفصل', 'البريد الإلكتروني', 'رقم الهاتف', 'الجنس'];
    const sampleData = [
      ['S2001', 'أحمد محمد السالم', 'student11', 'pass123', 'متوسط أول', '1أ', 'ahmad@school.sa', '0501234567', 'ذكر'],
      ['S2002', 'فاطمة علي الزهراني', 'student12', 'pass123', 'متوسط أول', '1أ', 'fatima@school.sa', '0501234568', 'أنثى'],
      ['S2003', 'محمد خالد العتيبي', 'student13', 'pass123', 'متوسط أول', '1ب', 'mohamed@school.sa', '0501234569', 'ذكر']
    ];

    // Create HTML table
    let html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>قالب رفع الطلاب - ${this.schoolName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          
          * {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            padding: 20px;
            background: #f3f4f6;
          }
          
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 10px;
            font-size: 28px;
          }
          
          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 16px;
          }
          
          .instructions {
            background: #eff6ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .instructions h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
          }
          
          .instructions ol {
            margin-right: 20px;
            line-height: 2;
            color: #374151;
          }
          
          .instructions li {
            margin-bottom: 10px;
          }
          
          .instructions strong {
            color: #1e40af;
          }
          
          .note {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
            color: #92400e;
          }
          
          .note strong {
            display: block;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            direction: rtl;
          }
          
          th, td {
            border: 2px solid #e5e7eb;
            padding: 12px;
            text-align: right;
          }
          
          th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          
          td {
            background: white;
            color: #374151;
          }
          
          tr:nth-child(even) td {
            background: #f9fafb;
          }
          
          .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${this.schoolName}</h1>
          <div class="subtitle">قالب رفع أسماء الطلاب - ملف Excel</div>
          
          <div class="instructions">
            <h2>📋 تعليمات الاستخدام:</h2>
            <ol>
              <li><strong>احفظ هذا الملف</strong> بصيغة Excel (.xlsx) من متصفحك</li>
              <li><strong>احذف البيانات النموذجية</strong> (الصفوف 2-4) واستبدلها ببيانات طلابك الفعلية</li>
              <li><strong>لا تغير أسماء الأعمدة</strong> (الصف الأول) - يجب أن تبقى كما هي</li>
              <li><strong>املأ جميع الحقول المطلوبة</strong> لكل طالب</li>
              <li><strong>تأكد من صحة البيانات</strong> قبل الرفع</li>
              <li><strong>احفظ الملف</strong> بعد التعديل</li>
              <li><strong>ارفع الملف</strong> من خلال لوحة الإدارة في النظام</li>
            </ol>
          </div>
          
          <div class="note">
            <strong>⚠️ ملاحظات هامة:</strong>
            • <strong>الرقم الطلابي:</strong> يجب أن يكون فريداً لكل طالب<br>
            • <strong>اسم المستخدم:</strong> يجب أن يكون فريداً، حروف إنجليزية وأرقام فقط<br>
            • <strong>كلمة المرور:</strong> يفضل استخدام كلمة مرور موحدة للطلاب (مثل: pass123)<br>
            • <strong>الصف:</strong> أمثلة: متوسط أول، متوسط ثاني، متوسط ثالث<br>
            • <strong>الفصل:</strong> أمثلة: 1أ، 1ب، 2أ، 2ب<br>
            • <strong>الجنس:</strong> ذكر أو أنثى فقط
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sampleData.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            جميع الحقوق محفوظة © ${new Date().getFullYear()} - ${this.schoolName}
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قالب_رفع_الطلاب_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('تم تحميل القالب بنجاح', 'افتح الملف واحفظه بصيغة Excel');
  }

  // Generate teachers Excel template
  generateTeachersTemplate() {
    const headers = ['الرقم الوظيفي', 'الاسم الكامل', 'المادة', 'التخصص', 'البريد الإلكتروني', 'رقم الهاتف', 'الجنس'];
    const sampleData = [
      ['T101', 'عبدالله أحمد المالكي', 'رياضيات', 'رياضيات بحتة', 'abdullah@school.sa', '0501234570', 'ذكر'],
      ['T102', 'نورة محمد القحطاني', 'علوم', 'أحياء', 'nora@school.sa', '0501234571', 'أنثى'],
      ['T103', 'خالد سعد الغامدي', 'لغة عربية', 'لغة عربية', 'khalid@school.sa', '0501234572', 'ذكر']
    ];

    let html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>قالب رفع المعلمين - ${this.schoolName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          
          * {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            padding: 20px;
            background: #f3f4f6;
          }
          
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 10px;
            font-size: 28px;
          }
          
          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 16px;
          }
          
          .instructions {
            background: #eff6ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .instructions h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
          }
          
          .instructions ol {
            margin-right: 20px;
            line-height: 2;
            color: #374151;
          }
          
          .note {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
            color: #92400e;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 2px solid #e5e7eb;
            padding: 12px;
            text-align: right;
          }
          
          th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: bold;
          }
          
          tr:nth-child(even) td {
            background: #f9fafb;
          }
          
          .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${this.schoolName}</h1>
          <div class="subtitle">قالب رفع أسماء المعلمين - ملف Excel</div>
          
          <div class="instructions">
            <h2>📋 تعليمات الاستخدام:</h2>
            <ol>
              <li><strong>احفظ هذا الملف</strong> بصيغة Excel (.xlsx)</li>
              <li><strong>احذف البيانات النموذجية</strong> واستبدلها ببيانات معلميك</li>
              <li><strong>لا تغير أسماء الأعمدة</strong></li>
              <li><strong>املأ جميع الحقول المطلوبة</strong></li>
              <li><strong>ارفع الملف</strong> من لوحة الإدارة</li>
            </ol>
          </div>
          
          <div class="note">
            <strong>⚠️ ملاحظات:</strong><br>
            • <strong>الرقم الوظيفي:</strong> فريد لكل معلم<br>
            • <strong>المادة:</strong> أمثلة: رياضيات، علوم، لغة عربية، لغة إنجليزية<br>
            • <strong>التخصص:</strong> التخصص الدقيق للمعلم
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sampleData.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            جميع الحقوق محفوظة © ${new Date().getFullYear()} - ${this.schoolName}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قالب_رفع_المعلمين_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('تم تحميل القالب بنجاح', 'افتح الملف واحفظه بصيغة Excel');
  }

  // Parse Excel file using SheetJS (xlsx)
  async parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
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

      const data = await this.parseExcelFile(file);
      
      if (!data || data.length === 0) {
        toast.error('الملف فارغ أو غير صحيح');
        return;
      }

      const teachers = data.map((row, index) => {
        if (!row['الرقم الوظيفي'] || !row['الاسم الكامل'] || !row['المادة']) {
          throw new Error(`الصف ${index + 2}: بيانات ناقصة`);
        }

        return {
          employee_id: row['الرقم الوظيفي'],
          full_name: row['الاسم الكامل'],
          subject: row['المادة'],
          specialization: row['التخصص'] || null,
          email: row['البريد الإلكتروني'] || null,
          phone: row['رقم الهاتف'] || null,
          gender: row['الجنس'] || null
        };
      });

      const response = await axios.post('/api/admin/teachers/bulk-upload', { teachers });
      
      if (response.data.success) {
        toast.success(`تم رفع ${response.data.inserted} معلم بنجاح`);
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

// Create global Excel handler instance
const excelHandler = new ExcelHandler();
