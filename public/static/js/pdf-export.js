// ============================================
// Advanced PDF Export System
// نظام تصدير PDF المتقدم
// ============================================

class PDFExporter {
  constructor() {
    this.schoolName = 'نظام تقييم المعلمين - معلمي 2025';
    this.academicYear = '2025';
  }

  // Generate header for all PDFs
  addHeader(doc, title) {
    // School logo area (placeholder)
    doc.setFillColor(102, 126, 234);
    doc.rect(15, 15, 30, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('معلمي', 30, 32, { align: 'center' });
    doc.text('2025', 30, 40, { align: 'center' });

    // School name and title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(this.schoolName, doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(title, doc.internal.pageSize.width / 2, 35, { align: 'center' });

    // Date and academic year
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString('ar-SA');
    doc.text(`التاريخ: ${date}`, doc.internal.pageSize.width - 15, 25, { align: 'right' });
    doc.text(`العام الدراسي: ${this.academicYear}`, doc.internal.pageSize.width - 15, 32, { align: 'right' });

    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 50, doc.internal.pageSize.width - 15, 50);

    return 60; // Return Y position for content start
  }

  // Add footer with page numbers
  addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `صفحة ${i} من ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  }

  // Export single teacher report
  async exportTeacherReport(teacherId) {
    try {
      const response = await axios.get(`/api/admin/teacher-report/${teacherId}`);
      const data = response.data;

      if (!data.success) {
        toast.error('فشل في جلب بيانات المعلم');
        return;
      }

      const teacher = data.teacher;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      let yPos = this.addHeader(doc, 'تقرير تقييم المعلم');

      // Teacher information
      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text('معلومات المعلم', 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const teacherInfo = [
        ['الاسم الكامل', teacher.full_name],
        ['المادة', teacher.subject],
        ['الرقم الوظيفي', teacher.employee_id],
        ['البريد الإلكتروني', teacher.email || 'غير متوفر'],
        ['عدد التقييمات', teacher.total_evaluations?.toString() || '0'],
        ['المعدل العام', teacher.average_score ? `${teacher.average_score.toFixed(2)} / 10` : 'لا يوجد']
      ];

      doc.autoTable({
        startY: yPos,
        head: [['البيان', 'القيمة']],
        body: teacherInfo,
        theme: 'grid',
        styles: { 
          font: 'helvetica',
          halign: 'right',
          fontSize: 10
        },
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255
        },
        margin: { right: 15 }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Evaluation criteria statistics
      if (data.criteria && data.criteria.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('التقييم حسب المعايير', 15, yPos);
        yPos += 10;

        const criteriaData = data.criteria.map(c => [
          c.title,
          `${c.max_score}`,
          c.evaluation_count?.toString() || '0',
          c.average_score ? c.average_score.toFixed(2) : '0.00',
          c.average_score && c.max_score ? `${((c.average_score / c.max_score) * 100).toFixed(1)}%` : '0%'
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['المعيار', 'الدرجة القصوى', 'عدد التقييمات', 'المتوسط', 'النسبة المئوية']],
          body: criteriaData,
          theme: 'striped',
          styles: { 
            font: 'helvetica',
            halign: 'center',
            fontSize: 9
          },
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            halign: 'center'
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Performance by class
      if (data.classes && data.classes.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('الأداء حسب الفصول', 15, yPos);
        yPos += 10;

        const classData = data.classes.map(c => [
          `${c.grade_level} - ${c.class_name}`,
          c.student_count?.toString() || '0',
          c.average_score ? c.average_score.toFixed(2) : '0.00',
          c.average_score ? `${(c.average_score * 10).toFixed(1)}%` : '0%'
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['الفصل', 'عدد الطلاب', 'المتوسط', 'النسبة المئوية']],
          body: classData,
          theme: 'striped',
          styles: { 
            font: 'helvetica',
            halign: 'center',
            fontSize: 10
          },
          headStyles: {
            fillColor: [118, 75, 162],
            textColor: 255,
            halign: 'center'
          }
        });
      }

      // Add summary box
      if (doc.lastAutoTable.finalY < 240) {
        yPos = doc.lastAutoTable.finalY + 15;
      } else {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(245, 247, 250);
      doc.rect(15, yPos, doc.internal.pageSize.width - 30, 30, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('ملخص التقييم', doc.internal.pageSize.width / 2, yPos + 8, { align: 'center' });
      
      doc.setFontSize(10);
      const summary = teacher.average_score 
        ? `حصل المعلم على معدل ${teacher.average_score.toFixed(2)} من 10 بناءً على ${teacher.total_evaluations || 0} تقييم`
        : 'لم يتم تقييم هذا المعلم بعد';
      doc.text(summary, doc.internal.pageSize.width / 2, yPos + 18, { align: 'center' });

      this.addFooter(doc);

      // Save the PDF
      const fileName = `تقرير_${teacher.full_name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error exporting teacher report:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export comprehensive report for all teachers
  async exportComprehensiveReport() {
    try {
      const response = await axios.get('/api/admin/stats/overview');
      const teachersResponse = await axios.get('/api/admin/teachers-all');
      
      if (!response.data.success || !teachersResponse.data.success) {
        toast.error('فشل في جلب البيانات');
        return;
      }

      const stats = response.data.stats;
      const teachers = teachersResponse.data.teachers;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      let yPos = this.addHeader(doc, 'التقرير الشامل لتقييم المعلمين');

      // Overall statistics
      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text('الإحصائيات العامة', 15, yPos);
      yPos += 10;

      const overallStats = [
        ['عدد المعلمين', stats.totalTeachers?.toString() || '0'],
        ['عدد الطلاب', stats.totalStudents?.toString() || '0'],
        ['إجمالي التقييمات', stats.totalEvaluations?.toString() || '0'],
        ['التقييمات المكتملة', stats.completedEvaluations?.toString() || '0']
      ];

      doc.autoTable({
        startY: yPos,
        body: overallStats,
        theme: 'grid',
        styles: { 
          font: 'helvetica',
          halign: 'right',
          fontSize: 11
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [245, 247, 250] }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Teachers summary
      if (teachers && teachers.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('ملخص المعلمين', 15, yPos);
        yPos += 10;

        const teachersData = teachers.map((t, index) => [
          (index + 1).toString(),
          t.full_name,
          t.subject,
          t.total_evaluations?.toString() || '0',
          t.average_score ? t.average_score.toFixed(2) : '-'
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'الاسم', 'المادة', 'عدد التقييمات', 'المعدل']],
          body: teachersData,
          theme: 'striped',
          styles: { 
            font: 'helvetica',
            halign: 'center',
            fontSize: 9
          },
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            halign: 'center'
          }
        });
      }

      this.addFooter(doc);

      const fileName = `التقرير_الشامل_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success('تم تصدير التقرير الشامل بنجاح');
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export subject comparison report
  async exportSubjectComparison() {
    try {
      const response = await axios.get('/api/admin/reports/by-subject');
      
      if (!response.data.success) {
        toast.error('فشل في جلب بيانات المواد');
        return;
      }

      const subjects = response.data.subjects;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      let yPos = this.addHeader(doc, 'تقرير المقارنة حسب المادة');

      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text('مقارنة المواد الدراسية', 15, yPos);
      yPos += 10;

      const subjectData = subjects.map(s => [
        s.subject,
        s.teacher_count?.toString() || '0',
        s.evaluation_count?.toString() || '0',
        s.average_score ? s.average_score.toFixed(2) : '0.00',
        s.average_score ? `${(s.average_score * 10).toFixed(1)}%` : '0%'
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['المادة', 'عدد المعلمين', 'عدد التقييمات', 'المعدل', 'النسبة المئوية']],
        body: subjectData,
        theme: 'striped',
        styles: { 
          font: 'helvetica',
          halign: 'center',
          fontSize: 10
        },
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255,
          halign: 'center'
        }
      });

      this.addFooter(doc);

      const fileName = `مقارنة_المواد_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error exporting subject comparison:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }

  // Export class comparison report
  async exportClassComparison() {
    try {
      const response = await axios.get('/api/admin/reports/by-class');
      
      if (!response.data.success) {
        toast.error('فشل في جلب بيانات الفصول');
        return;
      }

      const classes = response.data.classes;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      let yPos = this.addHeader(doc, 'تقرير المقارنة حسب الفصل');

      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text('مقارنة الفصول الدراسية', 15, yPos);
      yPos += 10;

      const classData = classes.map(c => [
        `${c.grade_level} - ${c.class_name}`,
        c.student_count?.toString() || '0',
        c.evaluation_count?.toString() || '0',
        c.average_score ? c.average_score.toFixed(2) : '0.00',
        c.average_score ? `${(c.average_score * 10).toFixed(1)}%` : '0%'
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['الفصل', 'عدد الطلاب', 'عدد التقييمات', 'المعدل', 'النسبة المئوية']],
        body: classData,
        theme: 'striped',
        styles: { 
          font: 'helvetica',
          halign: 'center',
          fontSize: 10
        },
        headStyles: {
          fillColor: [118, 75, 162],
          textColor: 255,
          halign: 'center'
        }
      });

      this.addFooter(doc);

      const fileName = `مقارنة_الفصول_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error exporting class comparison:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }
}

// Create global PDF exporter instance
const pdfExporter = new PDFExporter();
