# 📦 دليل النسخ الاحتياطي لقاعدة البيانات

## 🎯 متى يجب أخذ نسخة احتياطية؟

⚠️ **خذ نسخة احتياطية قبل:**
1. ✅ تطبيق أي migration جديد
2. ✅ حذف بيانات كبيرة
3. ✅ تحديث النظام
4. ✅ تغيير هيكل الجداول
5. ✅ نهاية كل أسبوع (روتيني)

---

## 📝 **الطريقة 1: النسخ الاحتياطي اليدوي (SQL Dump)**

### **أ) تصدير قاعدة البيانات كاملة:**

```bash
# 1. التصدير من Cloudflare D1
npx wrangler d1 export afaq-almansourah-db --remote --output=backup-$(date +%Y%m%d-%H%M%S).sql

# مثال: سينشئ ملف backup-20251203-183000.sql
```

### **ب) تصدير جدول واحد فقط:**

```bash
# تصدير جدول evaluations فقط
npx wrangler d1 execute afaq-almansourah-db --remote \
  --command="SELECT * FROM evaluations" \
  --json > evaluations-backup-$(date +%Y%m%d).json
```

### **ج) استرجاع من النسخة الاحتياطية:**

```bash
# استيراد النسخة الاحتياطية
npx wrangler d1 execute afaq-almansourah-db --remote \
  --file=backup-20251203-183000.sql
```

---

## ⏱️ **الطريقة 2: Time Travel (استرجاع نقطة زمنية)**

Cloudflare D1 يحفظ **نقاط زمنية تلقائياً** لمدة **30 يوم**!

### **أ) عرض معلومات النقطة الزمنية الحالية:**

```bash
npx wrangler d1 time-travel info afaq-almansourah-db
```

### **ب) الحصول على bookmark لوقت محدد:**

```bash
# مثال: استرجاع لقبل 2 ساعة
npx wrangler d1 time-travel info afaq-almansourah-db \
  --timestamp="2025-12-03T16:00:00Z"
```

سيعطيك **bookmark** مثل:
```
00000024-00000002-00004fc9-607057c7ad6b9f93ad2d466428734e0a
```

### **ج) استرجاع قاعدة البيانات:**

```bash
npx wrangler d1 time-travel restore afaq-almansourah-db \
  --bookmark=00000024-00000002-00004fc9-607057c7ad6b9f93ad2d466428734e0a
```

⚠️ **تحذير**: هذا سيمسح البيانات الحالية ويستبدلها بالنسخة القديمة!

---

## 📊 **الطريقة 3: تصدير بيانات محددة**

### **تصدير التقييمات فقط:**

```bash
# تصدير كـ JSON
npx wrangler d1 execute afaq-almansourah-db --remote \
  --json \
  --command="SELECT e.*, u.username, u.full_name as student_name, t.full_name as teacher_name 
             FROM evaluations e 
             JOIN users u ON e.student_id = u.id 
             JOIN teachers t ON e.teacher_id = t.id" \
  > evaluations-full-$(date +%Y%m%d).json

# تصدير كـ CSV (عبر jq)
npx wrangler d1 execute afaq-almansourah-db --remote \
  --json \
  --command="SELECT * FROM evaluations" | \
  jq -r '.[] | [.id, .student_id, .teacher_id, .score] | @csv' \
  > evaluations-$(date +%Y%m%d).csv
```

### **تصدير الطلاب:**

```bash
npx wrangler d1 execute afaq-almansourah-db --remote \
  --json \
  --command="SELECT * FROM users WHERE user_type='student'" \
  > students-backup-$(date +%Y%m%d).json
```

### **تصدير المعلمين:**

```bash
npx wrangler d1 execute afaq-almansourah-db --remote \
  --json \
  --command="SELECT * FROM teachers" \
  > teachers-backup-$(date +%Y%m%d).json
```

---

## 🤖 **الطريقة 4: نسخ احتياطي تلقائي (Script)**

### **إنشاء script للنسخ الاحتياطي التلقائي:**

```bash
#!/bin/bash
# backup-db.sh

# إعدادات
BACKUP_DIR="/home/user/backups/afaq-almansourah"
DATE=$(date +%Y%m%d-%H%M%S)
DB_NAME="afaq-almansourah-db"

# إنشاء مجلد النسخ الاحتياطية
mkdir -p "$BACKUP_DIR"

# تصدير قاعدة البيانات
echo "🔄 Starting backup..."
npx wrangler d1 export $DB_NAME --remote \
  --output="$BACKUP_DIR/backup-$DATE.sql"

# تصدير JSON للتقييمات
npx wrangler d1 execute $DB_NAME --remote --json \
  --command="SELECT COUNT(*) as count FROM evaluations" \
  > "$BACKUP_DIR/stats-$DATE.json"

echo "✅ Backup completed: $BACKUP_DIR/backup-$DATE.sql"

# حذف النسخ الاحتياطية القديمة (أكثر من 7 أيام)
find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete

echo "🧹 Old backups cleaned up"
```

### **تشغيل Script يدوياً:**

```bash
chmod +x backup-db.sh
./backup-db.sh
```

### **جدولة تلقائية (Cron):**

```bash
# تشغيل كل يوم في 2 صباحاً
crontab -e

# أضف هذا السطر:
0 2 * * * /path/to/backup-db.sh
```

---

## 💾 **الطريقة 5: نسخ احتياطي محلي (Local Database)**

### **تصدير قاعدة البيانات المحلية:**

```bash
# نسخ ملف SQLite المحلي
cp .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite \
   backup-local-$(date +%Y%m%d).sqlite
```

---

## 📤 **حفظ النسخ الاحتياطية في أماكن آمنة:**

### **1. Google Drive:**
```bash
# استخدم rclone
rclone copy backup-*.sql gdrive:/backups/afaq-almansourah/
```

### **2. Dropbox:**
```bash
# استخدم Dropbox CLI
~/dropbox_uploader.sh upload backup-*.sql /backups/
```

### **3. AI Drive (GenSpark):**
```bash
# نسخ للـ AI Drive
cp backup-*.sql /mnt/aidrive/backups/
```

### **4. Git LFS (للملفات الكبيرة):**
```bash
# إضافة للـ Git LFS
git lfs track "*.sql"
git add backup-*.sql
git commit -m "Add database backup"
git push
```

---

## 🔍 **التحقق من النسخة الاحتياطية:**

### **عرض محتوى النسخة:**

```bash
# عرض أول 50 سطر
head -50 backup-20251203-183000.sql

# البحث عن جدول محدد
grep "CREATE TABLE evaluations" backup-20251203-183000.sql

# عد عدد INSERT statements
grep -c "INSERT INTO" backup-20251203-183000.sql
```

### **اختبار النسخة على قاعدة محلية:**

```bash
# إنشاء قاعدة اختبار
sqlite3 test-backup.db < backup-20251203-183000.sql

# التحقق من البيانات
sqlite3 test-backup.db "SELECT COUNT(*) FROM evaluations"
```

---

## ⚡ **نصائح مهمة:**

1. ✅ **خذ نسخة احتياطية قبل أي تعديل خطير**
2. ✅ **احفظ 3 نسخ على الأقل** (يومي، أسبوعي، شهري)
3. ✅ **اختبر الاسترجاع** بشكل دوري
4. ✅ **احتفظ بالنسخ في أماكن متعددة**
5. ⚠️ **لا تحذف النسخ القديمة بسرعة**

---

## 🚨 **استرجاع طارئ:**

### **إذا فقدت البيانات:**

```bash
# 1. استخدم Time Travel أولاً (الأسرع)
npx wrangler d1 time-travel info afaq-almansourah-db \
  --timestamp="2025-12-03T12:00:00Z"

# 2. استعد للـ bookmark المناسب
npx wrangler d1 time-travel restore afaq-almansourah-db \
  --bookmark=<BOOKMARK_ID>

# 3. إذا فشل، استخدم النسخة الاحتياطية اليدوية
npx wrangler d1 execute afaq-almansourah-db --remote \
  --file=backup-latest.sql
```

---

## 📅 **جدول النسخ الاحتياطي المقترح:**

| الوقت | النوع | الطريقة |
|------|-------|---------|
| يومي | كامل | Time Travel (تلقائي) |
| أسبوعي | SQL Dump | يدوي |
| شهري | كامل + JSON | Script تلقائي |
| قبل Migration | كامل | يدوي إجباري |

---

## 📞 **الدعم:**

إذا واجهت مشكلة في النسخ الاحتياطي:
1. تحقق من صلاحيات CLOUDFLARE_API_TOKEN
2. تأكد من اتصالك بالإنترنت
3. جرب Time Travel كحل أول
4. راجع logs في `.wrangler/logs/`

---

## 🎓 **أمثلة عملية:**

### **مثال 1: نسخة احتياطية سريعة قبل Migration:**

```bash
# تصدير سريع
npx wrangler d1 export afaq-almansourah-db --remote \
  --output=before-migration-$(date +%Y%m%d-%H%M%S).sql

# تطبيق Migration
npx wrangler d1 migrations apply afaq-almansourah-db --remote

# إذا حدثت مشكلة، استرجع:
npx wrangler d1 execute afaq-almansourah-db --remote \
  --file=before-migration-*.sql
```

### **مثال 2: نسخة احتياطية أسبوعية:**

```bash
#!/bin/bash
# weekly-backup.sh

DATE=$(date +%Y%m%d)
BACKUP_NAME="weekly-backup-$DATE"

# تصدير قاعدة البيانات
npx wrangler d1 export afaq-almansourah-db --remote \
  --output="$BACKUP_NAME.sql"

# ضغط الملف
gzip "$BACKUP_NAME.sql"

# نسخ للـ AI Drive
cp "$BACKUP_NAME.sql.gz" /mnt/aidrive/backups/

echo "✅ Weekly backup completed: $BACKUP_NAME.sql.gz"
```

---

**تاريخ التحديث:** 2025-12-03  
**الإصدار:** v6.2  
**المؤلف:** نظام آفاق المنصورة
