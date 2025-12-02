// ============================================
// Advanced PDF Export System with Arabic Support
// نظام تصدير PDF المتقدم مع دعم اللغة العربية
// ============================================

class PDFExporter {
  constructor() {
    this.schoolName = 'نظام تقييم المعلمين - معلمي 2025';
    this.academicYear = '2025';
  }

  // Helper to create printable HTML content
  createPrintableContent(title, content) {
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          
          * {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            padding: 30px;
            background: white;
            color: #1f2937;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #667eea;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .header h2 {
            color: #764ba2;
            font-size: 20px;
            margin-bottom: 5px;
          }
          
          .header .meta {
            color: #6b7280;
            font-size: 14px;
            margin-top: 10px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: right;
          }
          
          th {
            background: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          
          tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-item {
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            background: #f9fafb;
          }
          
          .info-label {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #1f2937;
            font-size: 16px;
            font-weight: bold;
          }
          
          .badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
          }
          
          .badge-success { background: #d1fae5; color: #065f46; }
          .badge-info { background: #dbeafe; color: #1e40af; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          
          .summary {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-top: 30px;
          }
          
          .summary-title {
            color: #1e40af;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .summary-text {
            color: #374151;
            font-size: 16px;
            line-height: 1.6;
          }
          
          .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          
          @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.schoolName}</h1>
          <h2>${title}</h2>
          <div class="meta">
            <span>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</span>
            <span style="margin: 0 20px;">|</span>
            <span>العام الدراسي: ${this.academicYear}</span>
          </div>
        </div>
        
        ${content}
        
        <div class="footer">
          تم إنشاء هذا التقرير بواسطة نظام معلمي 2025 - جميع الحقوق محفوظة
        </div>
      </body>
      </html>
    `;
  }

  // Convert HTML to PDF using html2canvas
  async htmlToPDF(html, filename) {
    try {
      // Create temporary iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm'; // A4 width
      iframe.style.height = '297mm'; // A4 height
      document.body.appendChild(iframe);

      // Write content to iframe
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the body element
      const element = iframe.contentDocument.body;

      // Convert to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const { jsPDF } = window.jspdf;
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(iframe);

      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF');
    }
  }

  // Export single teacher report
  async exportTeacherReport(teacherId) {
    try {
      toast.info('جاري إنشاء التقرير...', 'يرجى الانتظار');
      
      const response = await axios.get(`/api/admin/teacher-report/${teacherId}`);
      const data = response.data;

      if (!data.success) {
        toast.error('فشل في جلب بيانات المعلم');
        return;
      }

      const teacher = data.teacher;
      const criteria = data.criteria || [];
      const classes = data.classes || [];

      const content = `
        <div class="section">
          <div class="section-title">معلومات المعلم</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">الاسم الكامل</div>
              <div class="info-value">${teacher.full_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">المادة</div>
              <div class="info-value">${teacher.subject}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الرقم الوظيفي</div>
              <div class="info-value">${teacher.employee_id || 'غير متوفر'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">البريد الإلكتروني</div>
              <div class="info-value">${teacher.email || 'غير متوفر'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">عدد التقييمات</div>
              <div class="info-value">${teacher.total_evaluations || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">المعدل العام</div>
              <div class="info-value">${teacher.average_score ? `${parseFloat(teacher.average_score).toFixed(2)} / 10` : 'لا يوجد'}</div>
            </div>
          </div>
        </div>

        ${criteria.length > 0 ? `
          <div class="section">
            <div class="section-title">الأداء حسب المعايير</div>
            <table>
              <thead>
                <tr>
                  <th>المعيار</th>
                  <th style="text-align: center;">الدرجة القصوى</th>
                  <th style="text-align: center;">عدد التقييمات</th>
                  <th style="text-align: center;">المتوسط</th>
                  <th style="text-align: center;">النسبة المئوية</th>
                  <th style="text-align: center;">التقييم</th>
                </tr>
              </thead>
              <tbody>
                ${criteria.map(c => {
                  const avg = c.average_score || 0;
                  const percentage = ((avg / c.max_score) * 100).toFixed(1);
                  let badge = 'badge-danger';
                  let rating = 'ضعيف';
                  
                  if (percentage >= 90) {
                    badge = 'badge-success';
                    rating = 'ممتاز';
                  } else if (percentage >= 80) {
                    badge = 'badge-info';
                    rating = 'جيد جداً';
                  } else if (percentage >= 70) {
                    badge = 'badge-warning';
                    rating = 'جيد';
                  } else if (percentage >= 60) {
                    badge = 'badge-warning';
                    rating = 'مقبول';
                  }
                  
                  return `
                    <tr>
                      <td><strong>${c.title}</strong></td>
                      <td style="text-align: center;">${c.max_score}</td>
                      <td style="text-align: center;">${c.evaluation_count || 0}</td>
                      <td style="text-align: center;"><strong>${avg.toFixed(2)}</strong></td>
                      <td style="text-align: center;"><strong>${percentage}%</strong></td>
                      <td style="text-align: center;"><span class="badge ${badge}">${rating}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${classes.length > 0 ? `
          <div class="section">
            <div class="section-title">الأداء حسب الفصول</div>
            <table>
              <thead>
                <tr>
                  <th>الفصل</th>
                  <th style="text-align: center;">عدد الطلاب</th>
                  <th style="text-align: center;">المتوسط</th>
                  <th style="text-align: center;">النسبة المئوية</th>
                </tr>
              </thead>
              <tbody>
                ${classes.map(c => {
                  const avg = c.average_score || 0;
                  const percentage = ((avg / 10) * 100).toFixed(1);
                  return `
                    <tr>
                      <td><strong>${c.grade_level} - ${c.class_name}</strong></td>
                      <td style="text-align: center;">${c.student_count || 0}</td>
                      <td style="text-align: center;"><strong>${avg.toFixed(2)} / 10</strong></td>
                      <td style="text-align: center;"><strong>${percentage}%</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="summary">
          <div class="summary-title">ملخص التقييم</div>
          <div class="summary-text">
            ${teacher.average_score 
              ? `حصل المعلم <strong>${teacher.full_name}</strong> على معدل <strong>${parseFloat(teacher.average_score).toFixed(2)} من 10</strong> بناءً على <strong>${teacher.total_evaluations || 0}</strong> تقييم من الطلاب.`
              : `لم يتم تقييم المعلم <strong>${teacher.full_name}</strong> بعد.`
            }
          </div>
        </div>
      `;

      const html = this.createPrintableContent('تقرير تقييم المعلم', content);
      const filename = `تقرير_${teacher.full_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      
      await this.htmlToPDF(html, filename);
    } catch (error) {
      console.error('Error exporting teacher report:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export student evaluation report for a specific teacher
  async exportStudentEvaluation(studentId, teacherId) {
    try {
      toast.info('جاري إنشاء التقرير...', 'يرجى الانتظار');
      
      const response = await axios.get(`/api/evaluation/student-report/${studentId}/${teacherId}`);
      const data = response.data;

      if (!data.success) {
        toast.error('فشل في جلب بيانات التقييم');
        return;
      }

      const student = data.student;
      const teacher = data.teacher;
      const evaluations = data.evaluations || [];

      const content = `
        <div class="section">
          <div class="section-title">معلومات الطالب والمعلم</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">اسم الطالب</div>
              <div class="info-value">${student.full_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الصف والفصل</div>
              <div class="info-value">${student.grade_level} - ${student.class_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">اسم المعلم</div>
              <div class="info-value">${teacher.full_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">المادة</div>
              <div class="info-value">${teacher.subject}</div>
            </div>
          </div>
        </div>

        ${evaluations.length > 0 ? `
          <div class="section">
            <div class="section-title">نتائج التقييم</div>
            <table>
              <thead>
                <tr>
                  <th>المعيار</th>
                  <th style="text-align: center;">الدرجة القصوى</th>
                  <th style="text-align: center;">الدرجة المحصلة</th>
                  <th style="text-align: center;">النسبة المئوية</th>
                  <th style="text-align: center;">التقييم</th>
                </tr>
              </thead>
              <tbody>
                ${evaluations.map(e => {
                  const percentage = ((e.score / e.max_score) * 100).toFixed(1);
                  let badge = 'badge-danger';
                  let rating = 'ضعيف';
                  
                  if (percentage >= 90) {
                    badge = 'badge-success';
                    rating = 'ممتاز';
                  } else if (percentage >= 80) {
                    badge = 'badge-info';
                    rating = 'جيد جداً';
                  } else if (percentage >= 70) {
                    badge = 'badge-warning';
                    rating = 'جيد';
                  } else if (percentage >= 60) {
                    badge = 'badge-warning';
                    rating = 'مقبول';
                  }
                  
                  return `
                    <tr>
                      <td><strong>${e.criteria_title}</strong></td>
                      <td style="text-align: center;">${e.max_score}</td>
                      <td style="text-align: center;"><strong>${e.score}</strong></td>
                      <td style="text-align: center;"><strong>${percentage}%</strong></td>
                      <td style="text-align: center;"><span class="badge ${badge}">${rating}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div class="summary-title">الملخص العام</div>
            <div class="summary-text">
              حصل الطالب <strong>${student.full_name}</strong> على متوسط 
              <strong>${(evaluations.reduce((sum, e) => sum + (e.score / e.max_score * 10), 0) / evaluations.length).toFixed(2)} من 10</strong>
              في تقييم المعلم <strong>${teacher.full_name}</strong> لمادة <strong>${teacher.subject}</strong>.
            </div>
          </div>
        ` : `
          <div class="summary">
            <div class="summary-text">
              لا توجد تقييمات للطالب <strong>${student.full_name}</strong> للمعلم <strong>${teacher.full_name}</strong> حتى الآن.
            </div>
          </div>
        `}
      `;

      const html = this.createPrintableContent('تقرير تقييم الطالب', content);
      const filename = `تقييم_${student.full_name}_${teacher.full_name}_${Date.now()}.pdf`;
      
      await this.htmlToPDF(html, filename);
    } catch (error) {
      console.error('Error exporting student evaluation:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export comprehensive report for all teachers
  async exportComprehensiveReport() {
    try {
      toast.info('جاري إنشاء التقرير الشامل...', 'يرجى الانتظار');
      
      const [statsResponse, teachersResponse] = await Promise.all([
        axios.get('/api/admin/stats/overview'),
        axios.get('/api/admin/teachers-all')
      ]);

      if (!statsResponse.data.success || !teachersResponse.data.success) {
        toast.error('فشل في جلب البيانات');
        return;
      }

      const stats = statsResponse.data.stats;
      const teachers = teachersResponse.data.teachers;

      const content = `
        <div class="section">
          <div class="section-title">الإحصائيات العامة</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">عدد المعلمين</div>
              <div class="info-value">${stats.totalTeachers || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">عدد الطلاب</div>
              <div class="info-value">${stats.totalStudents || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">إجمالي التقييمات</div>
              <div class="info-value">${stats.totalEvaluations || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">التقييمات المكتملة</div>
              <div class="info-value">${stats.completedEvaluations || 0}</div>
            </div>
          </div>
        </div>

        ${teachers && teachers.length > 0 ? `
          <div class="section">
            <div class="section-title">ملخص المعلمين</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center;">#</th>
                  <th>الاسم</th>
                  <th style="text-align: center;">المادة</th>
                  <th style="text-align: center;">عدد التقييمات</th>
                  <th style="text-align: center;">المعدل</th>
                </tr>
              </thead>
              <tbody>
                ${teachers.map((t, index) => `
                  <tr>
                    <td style="text-align: center;"><strong>${index + 1}</strong></td>
                    <td><strong>${t.full_name}</strong></td>
                    <td style="text-align: center;">${t.subject}</td>
                    <td style="text-align: center;">${t.total_evaluations || 0}</td>
                    <td style="text-align: center;"><strong>${t.average_score ? parseFloat(t.average_score).toFixed(2) : '-'}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      `;

      const html = this.createPrintableContent('التقرير الشامل لتقييم المعلمين', content);
      const filename = `التقرير_الشامل_${Date.now()}.pdf`;
      
      await this.htmlToPDF(html, filename);
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export subject comparison report
  async exportSubjectComparison() {
    try {
      toast.info('جاري إنشاء تقرير المقارنة...', 'يرجى الانتظار');
      
      const response = await axios.get('/api/admin/reports/by-subject');
      
      if (!response.data.success) {
        toast.error('فشل في جلب بيانات المواد');
        return;
      }

      const subjects = response.data.subjects;

      const content = `
        <div class="section">
          <div class="section-title">مقارنة المواد الدراسية</div>
          <table>
            <thead>
              <tr>
                <th>المادة</th>
                <th style="text-align: center;">عدد المعلمين</th>
                <th style="text-align: center;">عدد التقييمات</th>
                <th style="text-align: center;">المعدل</th>
                <th style="text-align: center;">النسبة المئوية</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.map(s => {
                const avg = s.average_score || 0;
                const percentage = ((avg / 10) * 100).toFixed(1);
                return `
                  <tr>
                    <td><strong>${s.subject}</strong></td>
                    <td style="text-align: center;">${s.teacher_count || 0}</td>
                    <td style="text-align: center;">${s.evaluation_count || 0}</td>
                    <td style="text-align: center;"><strong>${avg.toFixed(2)}</strong></td>
                    <td style="text-align: center;"><strong>${percentage}%</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      const html = this.createPrintableContent('تقرير المقارنة حسب المادة', content);
      const filename = `مقارنة_المواد_${Date.now()}.pdf`;
      
      await this.htmlToPDF(html, filename);
    } catch (error) {
      console.error('Error exporting subject comparison:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export class comparison report
  async exportClassComparison() {
    try {
      toast.info('جاري إنشاء تقرير المقارنة...', 'يرجى الانتظار');
      
      const response = await axios.get('/api/admin/reports/by-class');
      
      if (!response.data.success) {
        toast.error('فشل في جلب بيانات الفصول');
        return;
      }

      const classes = response.data.classes;

      const content = `
        <div class="section">
          <div class="section-title">مقارنة الفصول الدراسية</div>
          <table>
            <thead>
              <tr>
                <th>الفصل</th>
                <th style="text-align: center;">عدد الطلاب</th>
                <th style="text-align: center;">عدد التقييمات</th>
                <th style="text-align: center;">المعدل</th>
                <th style="text-align: center;">النسبة المئوية</th>
              </tr>
            </thead>
            <tbody>
              ${classes.map(c => {
                const avg = c.average_score || 0;
                const percentage = ((avg / 10) * 100).toFixed(1);
                return `
                  <tr>
                    <td><strong>${c.grade_level} - ${c.class_name}</strong></td>
                    <td style="text-align: center;">${c.student_count || 0}</td>
                    <td style="text-align: center;">${c.evaluation_count || 0}</td>
                    <td style="text-align: center;"><strong>${avg.toFixed(2)}</strong></td>
                    <td style="text-align: center;"><strong>${percentage}%</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      const html = this.createPrintableContent('تقرير المقارنة حسب الفصل', content);
      const filename = `مقارنة_الفصول_${Date.now()}.pdf`;
      
      await this.htmlToPDF(html, filename);
    } catch (error) {
      console.error('Error exporting class comparison:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }
}

// Create global PDF exporter instance
const pdfExporter = new PDFExporter();
