# 🚀 دليل النشر على Cloudflare Pages - خطوات يسيرة

## متوسطة آفاق المنصورة الأهلية - نظام معلمي 2025

---

## 📋 **المتطلبات (5 دقائق)**

### 1️⃣ **حساب Cloudflare (مجاني)**
- اذهب إلى: https://dash.cloudflare.com/sign-up
- أنشئ حساب مجاني (بالإيميل فقط)
- ✅ **مجاني تماماً** - لا حاجة لبطاقة ائتمانية

### 2️⃣ **Cloudflare API Token**
1. سجل دخول: https://dash.cloudflare.com
2. اذهب إلى: **My Profile** → **API Tokens**
   - الرابط المباشر: https://dash.cloudflare.com/profile/api-tokens
3. اضغط: **Create Token**
4. اختر: **Edit Cloudflare Workers** (أو Custom Token)
5. **الصلاحيات المطلوبة:**
   ```
   Account - Cloudflare Pages - Edit
   Account - D1 - Edit
   ```
6. احفظ الـ Token (سيظهر مرة واحدة فقط)

---

## 🎯 **خطوات النشر (10 دقائق)**

### **الخطوة 1: إعداد Cloudflare API Token**

```bash
# في الساندبوكس، قم بإعداد الـ Token
export CLOUDFLARE_API_TOKEN="your-api-token-here"
```

أو استخدم أمر `setup_cloudflare_api_key` الذي سيساعدك تلقائياً.

---

### **الخطوة 2: إنشاء قاعدة بيانات D1 (الإنتاج)**

```bash
cd /home/user/webapp

# إنشاء قاعدة البيانات
npx wrangler d1 create afaq-almansourah-db

# ستحصل على:
# ✅ database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# احفظ هذا الـ ID!
```

---

### **الخطوة 3: تحديث wrangler.jsonc**

افتح ملف `wrangler.jsonc` وحدّث:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "afaq-almansourah",  // ← غيّر هنا
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  
  // أضف قاعدة البيانات
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "afaq-almansourah-db",
      "database_id": "PASTE-YOUR-DATABASE-ID-HERE"  // ← ضع الـ ID من الخطوة 2
    }
  ]
}
```

---

### **الخطوة 4: تطبيق migrations على قاعدة الإنتاج**

```bash
# تطبيق جميع التحديثات على قاعدة الإنتاج
npx wrangler d1 migrations apply afaq-almansourah-db
```

---

### **الخطوة 5: بناء التطبيق**

```bash
# بناء التطبيق للإنتاج
npm run build

# التحقق من الملفات
ls -lh dist/
# يجب أن ترى: _worker.js, _routes.json, وملفات static/
```

---

### **الخطوة 6: إنشاء مشروع Cloudflare Pages**

```bash
# إنشاء مشروع جديد
npx wrangler pages project create afaq-almansourah \
  --production-branch main \
  --compatibility-date 2024-01-01

# ملاحظة: استخدم branch 'main' دائماً
```

---

### **الخطوة 7: نشر التطبيق 🚀**

```bash
# رفع التطبيق على Cloudflare Pages
npx wrangler pages deploy dist --project-name afaq-almansourah

# ستحصل على رابطين:
# ✅ Production: https://random-id.afaq-almansourah.pages.dev
# ✅ Branch: https://main.afaq-almansourah.pages.dev
```

---

## ✅ **اختبار التطبيق**

### **1. افتح الرابط**
```
https://afaq-almansourah.pages.dev
```

### **2. سجل دخول**
```
المدير: admin / admin123
الطلاب: student1-10 / pass123
```

### **3. اختبر الميزات:**
- ✅ تسجيل الدخول
- ✅ عرض الشعار الثلاثي الأبعاد
- ✅ إدارة الطلاب
- ✅ إدارة المعلمين  
- ✅ التقييمات
- ✅ التقارير PDF
- ✅ رفع Excel
- ✅ حذف جماعي

---

## 🔧 **تحديث التطبيق لاحقاً**

### **كلما أردت تحديث التطبيق:**

```bash
# 1. عدّل الكود في الساندبوكس
# 2. ابنِ التطبيق
npm run build

# 3. ارفع التحديث
npx wrangler pages deploy dist --project-name afaq-almansourah

# ✅ التحديث فوري! (أقل من دقيقة)
```

---

## 🎨 **تخصيصات إضافية (اختياري)**

### **1. دومين مخصص**
```bash
# إذا كان لديك دومين (مثلاً: afaq.edu.sa)
npx wrangler pages domain add afaq.edu.sa \
  --project-name afaq-almansourah
```

### **2. متغيرات البيئة (Secrets)**
```bash
# إضافة مفاتيح سرية (مثل API keys)
npx wrangler pages secret put API_KEY \
  --project-name afaq-almansourah

# سيطلب منك إدخال القيمة
```

### **3. تغيير اسم المدرسة**
- افتح `src/index.tsx`
- ابحث عن: `school_name: 'متوسطة آفاق المنصورة الأهلية'`
- غيّر الاسم
- ابنِ وارفع التحديث

---

## 📊 **المزايا بعد النشر**

| الميزة | الساندبوكس | Cloudflare Pages |
|--------|------------|------------------|
| **السرعة** | 500-1000ms | **<100ms** ⚡ |
| **التوزيع** | موقع واحد | **300+ موقع عالمياً** 🌍 |
| **الزوار** | محدود | **100,000/يوم مجاناً** 🎉 |
| **الأمان** | محدود | **DDoS Protection + SSL** 🔒 |
| **التوفر** | محدود | **99.99% Uptime** ✅ |

---

## 🆘 **حل المشاكل الشائعة**

### **مشكلة: Database not found**
```bash
# تأكد من:
1. تحديث database_id في wrangler.jsonc
2. تطبيق migrations: npx wrangler d1 migrations apply afaq-almansourah-db
```

### **مشكلة: Authentication failed**
```bash
# تأكد من:
1. CLOUDFLARE_API_TOKEN صحيح
2. الصلاحيات: Pages + D1
3. أعد تسجيل الدخول: npx wrangler login
```

### **مشكلة: Build failed**
```bash
# نظف وأعد البناء
rm -rf dist node_modules
npm install
npm run build
```

---

## 📞 **الدعم**

### **وثائق Cloudflare:**
- Pages: https://developers.cloudflare.com/pages
- D1: https://developers.cloudflare.com/d1
- Wrangler: https://developers.cloudflare.com/workers/wrangler

### **مجتمع Cloudflare:**
- Discord: https://discord.gg/cloudflaredev
- Forum: https://community.cloudflare.com

---

## ✅ **Checklist قبل النشر**

- [ ] حساب Cloudflare جاهز
- [ ] API Token محفوظ
- [ ] قاعدة D1 منشأة
- [ ] wrangler.jsonc محدّث
- [ ] Migrations مطبّقة
- [ ] Build ناجح
- [ ] Pages Project منشأ
- [ ] Deploy تم بنجاح
- [ ] الرابط يعمل
- [ ] تسجيل الدخول يعمل

---

## 🎉 **مبروك!**

تطبيقك الآن:
- ✅ **عالمي** (300+ موقع)
- ✅ **سريع** (<100ms)
- ✅ **آمن** (SSL + DDoS)
- ✅ **مجاني** (100K زائر/يوم)
- ✅ **احترافي** 🚀

---

**متوسطة آفاق المنصورة الأهلية - نظام معلمي 2025**
**v5.2 - جاهز للإنتاج**
