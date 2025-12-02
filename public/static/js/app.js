// Global state
let currentUser = null;
let currentTeacher = null;
let evaluationCriteria = [];
let settings = {};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  checkAuth();
});

// Load settings
async function loadSettings() {
  try {
    const response = await axios.get('/api/settings');
    if (response.data.success) {
      settings = response.data.settings;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Check authentication
function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    currentUser = JSON.parse(user);
    if (currentUser.user_type === 'admin') {
      showAdminDashboard();
    } else {
      showTeacherSelection();
    }
  } else {
    showLoginPage();
  }
}

// ============================================
// Login Page
// ============================================
function showLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-md mx-auto fade-in">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="icon-3d inline-block mb-4">
          <i class="fas fa-chalkboard-teacher text-white" style="font-size: 5rem;"></i>
        </div>
        <h1 class="text-5xl font-bold text-white mb-2">معلمي 2025</h1>
        <p class="text-white text-xl opacity-90">${settings.school_name || 'نظام تقييم المعلمين'}</p>
      </div>

      <!-- Login Card -->
      <div class="glass-card p-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>
        
        <form id="loginForm" class="space-y-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2 text-lg">
              <i class="fas fa-user ml-2"></i>
              اسم المستخدم
            </label>
            <input 
              type="text" 
              id="username" 
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg"
              required
              autocomplete="username"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2 text-lg">
              <i class="fas fa-lock ml-2"></i>
              كلمة المرور
            </label>
            <input 
              type="password" 
              id="password" 
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg"
              required
              autocomplete="current-password"
            >
          </div>

          <div id="loginError" class="hidden bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded">
          </div>

          <button 
            type="submit" 
            class="w-full btn-primary text-white py-3 rounded-lg font-bold text-xl shadow-lg"
          >
            <i class="fas fa-sign-in-alt ml-2"></i>
            دخول
          </button>
        </form>

        <div class="mt-6 text-center">
          <button 
            onclick="showPasswordReset()" 
            class="text-purple-600 hover:text-purple-800 font-semibold text-lg"
          >
            <i class="fas fa-key ml-2"></i>
            نسيت كلمة المرور؟
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const response = await axios.post('/api/auth/login', { username, password });
    
    if (response.data.success) {
      currentUser = response.data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Show welcome message
      showWelcomeMessage();
    } else {
      errorDiv.textContent = response.data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'حدث خطأ في الاتصال بالخادم';
    errorDiv.classList.remove('hidden');
  }
}

// ============================================
// Welcome Message
// ============================================
function showWelcomeMessage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-2xl mx-auto text-center fade-in">
      <div class="glass-card p-12">
        <div class="icon-3d inline-block mb-6">
          <i class="fas fa-user-check text-purple-600" style="font-size: 6rem;"></i>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-4">مرحباً بك!</h1>
        <p class="text-2xl text-gray-700 mb-8">${currentUser.full_name}</p>
        <div class="text-xl text-gray-600">
          ${currentUser.user_type === 'student' 
            ? `<p class="mb-2"><i class="fas fa-graduation-cap ml-2"></i>${currentUser.grade_level} - ${currentUser.class_name}</p>` 
            : '<p class="mb-2"><i class="fas fa-user-shield ml-2"></i>مدير النظام</p>'}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    if (currentUser.user_type === 'admin') {
      showAdminDashboard();
    } else {
      showTeacherSelection();
    }
  }, 2000);
}

// ============================================
// Password Reset
// ============================================
function showPasswordReset() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-md mx-auto fade-in">
      <div class="glass-card p-8">
        <button onclick="showLoginPage()" class="text-purple-600 hover:text-purple-800 mb-4">
          <i class="fas fa-arrow-right ml-2"></i>
          رجوع
        </button>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">إعادة تعيين كلمة المرور</h2>
        
        <div id="resetStep1">
          <form id="resetRequestForm" class="space-y-6">
            <div>
              <label class="block text-gray-700 font-semibold mb-2 text-lg">
                <i class="fas fa-user ml-2"></i>
                اسم المستخدم
              </label>
              <input 
                type="text" 
                id="resetUsername" 
                class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg"
                required
              >
            </div>

            <div id="resetError" class="hidden bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded">
            </div>

            <button 
              type="submit" 
              class="w-full btn-primary text-white py-3 rounded-lg font-bold text-xl shadow-lg"
            >
              <i class="fas fa-paper-plane ml-2"></i>
              إرسال طلب إعادة التعيين
            </button>
          </form>
        </div>

        <div id="resetStep2" class="hidden">
          <form id="resetPasswordForm" class="space-y-6">
            <div class="bg-green-100 border-r-4 border-green-500 text-green-700 p-4 rounded mb-6">
              <p class="font-semibold">تم إرسال رمز إعادة التعيين</p>
              <p id="resetTokenDisplay" class="mt-2 font-mono text-lg"></p>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2 text-lg">
                <i class="fas fa-key ml-2"></i>
                رمز إعادة التعيين
              </label>
              <input 
                type="text" 
                id="resetToken" 
                class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg font-mono"
                required
              >
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2 text-lg">
                <i class="fas fa-lock ml-2"></i>
                كلمة المرور الجديدة
              </label>
              <input 
                type="password" 
                id="newPassword" 
                class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg"
                required
              >
            </div>

            <button 
              type="submit" 
              class="w-full btn-primary text-white py-3 rounded-lg font-bold text-xl shadow-lg"
            >
              <i class="fas fa-check ml-2"></i>
              تحديث كلمة المرور
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('resetRequestForm').addEventListener('submit', handleResetRequest);
}

async function handleResetRequest(e) {
  e.preventDefault();
  
  const username = document.getElementById('resetUsername').value;
  const errorDiv = document.getElementById('resetError');

  try {
    const response = await axios.post('/api/auth/reset-request', { username });
    
    if (response.data.success) {
      document.getElementById('resetStep1').classList.add('hidden');
      document.getElementById('resetStep2').classList.remove('hidden');
      document.getElementById('resetTokenDisplay').textContent = response.data.resetToken;
      
      document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const resetToken = document.getElementById('resetToken').value;
        const newPassword = document.getElementById('newPassword').value;
        
        try {
          const resetResponse = await axios.post('/api/auth/reset-password', {
            username,
            resetToken,
            newPassword
          });
          
          if (resetResponse.data.success) {
            alert('تم تحديث كلمة المرور بنجاح!');
            showLoginPage();
          } else {
            alert(resetResponse.data.message);
          }
        } catch (error) {
          alert('حدث خطأ في تحديث كلمة المرور');
        }
      });
    } else {
      errorDiv.textContent = response.data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'حدث خطأ في الاتصال بالخادم';
    errorDiv.classList.remove('hidden');
  }
}

// ============================================
// Teacher Selection
// ============================================
async function showTeacherSelection() {
  try {
    const response = await axios.get(`/api/teachers/${currentUser.grade_level}/${currentUser.class_name}`);
    const criteriaResponse = await axios.get('/api/criteria');
    
    if (response.data.success && criteriaResponse.data.success) {
      const teachers = response.data.teachers;
      evaluationCriteria = criteriaResponse.data.criteria;
      
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="max-w-6xl mx-auto fade-in">
          <!-- Header -->
          <div class="glass-card p-6 mb-8">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-3xl font-bold text-gray-800">${currentUser.full_name}</h1>
                <p class="text-gray-600 text-lg mt-1">
                  <i class="fas fa-school ml-2"></i>
                  ${currentUser.grade_level} - ${currentUser.class_name}
                </p>
              </div>
              <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-sign-out-alt ml-2"></i>
                خروج
              </button>
            </div>
          </div>

          <!-- Title -->
          <div class="text-center mb-8">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-users-cog text-white" style="font-size: 4rem;"></i>
            </div>
            <h2 class="text-4xl font-bold text-white mb-2">اختر المعلم للتقييم</h2>
            <p class="text-white text-xl opacity-90">قيّم معلميك بموضوعية ومصداقية</p>
          </div>

          <!-- Teachers Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${teachers.map(teacher => `
              <div class="glass-card p-6 hover:shadow-2xl transition-all slide-in">
                <div class="text-center">
                  <div class="icon-3d inline-block mb-4">
                    <i class="fas fa-user-tie text-purple-600" style="font-size: 3rem;"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-2">${teacher.full_name}</h3>
                  <p class="text-lg text-gray-600 mb-4">
                    <i class="fas fa-book ml-2"></i>
                    ${teacher.subject}
                  </p>
                  <button 
                    onclick="checkEvaluationStatus(${teacher.id}, '${teacher.full_name}', '${teacher.subject}')"
                    class="w-full btn-primary text-white py-3 rounded-lg font-bold text-lg shadow-lg"
                  >
                    <i class="fas fa-clipboard-check ml-2"></i>
                    ابدأ التقييم
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading teachers:', error);
  }
}

// Check evaluation status
async function checkEvaluationStatus(teacherId, teacherName, subject) {
  try {
    const response = await axios.get(`/api/evaluation/status/${currentUser.id}/${teacherId}`);
    
    if (response.data.completed) {
      alert('لقد قمت بتقييم هذا المعلم مسبقاً. شكراً لمشاركتك!');
    } else {
      currentTeacher = { id: teacherId, name: teacherName, subject: subject };
      showEvaluationForm();
    }
  } catch (error) {
    console.error('Error checking evaluation status:', error);
  }
}

// ============================================
// Evaluation Form
// ============================================
function showEvaluationForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-4xl mx-auto fade-in">
      <!-- Header -->
      <div class="glass-card p-6 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">تقييم المعلم: ${currentTeacher.name}</h2>
            <p class="text-gray-600 text-lg mt-1">
              <i class="fas fa-book ml-2"></i>
              ${currentTeacher.subject}
            </p>
          </div>
          <button onclick="showTeacherSelection()" class="text-purple-600 hover:text-purple-800 font-semibold">
            <i class="fas fa-arrow-right ml-2"></i>
            رجوع
          </button>
        </div>
      </div>

      <!-- Evaluation Form -->
      <div class="glass-card p-8">
        <div class="mb-8 text-center">
          <div class="icon-3d inline-block mb-4">
            <i class="fas fa-star text-yellow-500" style="font-size: 3rem;"></i>
          </div>
          <p class="text-xl text-gray-700">يرجى تقييم المعلم حسب المعايير التالية</p>
          <p class="text-gray-600 mt-2">التقييم من 1 إلى 10 نجوم</p>
        </div>

        <form id="evaluationForm" class="space-y-8">
          ${evaluationCriteria.map((criteria, index) => `
            <div class="border-b border-gray-200 pb-6">
              <div class="mb-4">
                <h3 class="text-xl font-bold text-gray-800 mb-2">
                  <span class="text-purple-600 ml-2">${index + 1}.</span>
                  ${criteria.title}
                </h3>
                ${criteria.description ? `<p class="text-gray-600 mr-8">${criteria.description}</p>` : ''}
              </div>
              
              <div class="flex justify-center items-center space-x-reverse space-x-2" id="rating-${criteria.id}">
                ${Array.from({length: criteria.max_score}, (_, i) => `
                  <i 
                    class="fas fa-star rating-star text-gray-300" 
                    data-criteria="${criteria.id}" 
                    data-score="${i + 1}"
                    onclick="setRating(${criteria.id}, ${i + 1})"
                  ></i>
                `).join('')}
              </div>
              
              <p class="text-center mt-2 text-gray-600">
                التقييم: <span id="score-${criteria.id}" class="font-bold text-purple-600">0</span> / ${criteria.max_score}
              </p>
            </div>
          `).join('')}

          <div id="evaluationError" class="hidden bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded">
          </div>

          <button 
            type="submit" 
            class="w-full btn-primary text-white py-4 rounded-lg font-bold text-xl shadow-lg"
          >
            <i class="fas fa-paper-plane ml-2"></i>
            إرسال التقييم
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('evaluationForm').addEventListener('submit', handleEvaluationSubmit);
}

// Rating system
const ratings = {};

function setRating(criteriaId, score) {
  ratings[criteriaId] = score;
  
  const stars = document.querySelectorAll(`[data-criteria="${criteriaId}"]`);
  stars.forEach(star => {
    const starScore = parseInt(star.getAttribute('data-score'));
    if (starScore <= score) {
      star.classList.remove('text-gray-300');
      star.classList.add('text-yellow-400', 'active');
    } else {
      star.classList.add('text-gray-300');
      star.classList.remove('text-yellow-400', 'active');
    }
  });
  
  document.getElementById(`score-${criteriaId}`).textContent = score;
}

// Submit evaluation
async function handleEvaluationSubmit(e) {
  e.preventDefault();
  
  const errorDiv = document.getElementById('evaluationError');
  
  // Check if all criteria are rated
  const allRated = evaluationCriteria.every(criteria => ratings[criteria.id] > 0);
  
  if (!allRated) {
    errorDiv.textContent = 'يرجى تقييم جميع المعايير قبل الإرسال';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  const evaluations = evaluationCriteria.map(criteria => ({
    criteriaId: criteria.id,
    score: ratings[criteria.id]
  }));
  
  try {
    const response = await axios.post('/api/evaluation/submit', {
      studentId: currentUser.id,
      teacherId: currentTeacher.id,
      gradeLevel: currentUser.grade_level,
      className: currentUser.class_name,
      subject: currentTeacher.subject,
      evaluations
    });
    
    if (response.data.success) {
      showSuccessMessage();
    } else {
      errorDiv.textContent = response.data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'حدث خطأ في إرسال التقييم';
    errorDiv.classList.remove('hidden');
  }
}

// Success message
function showSuccessMessage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-2xl mx-auto text-center fade-in">
      <div class="glass-card p-12">
        <div class="icon-3d inline-block mb-6">
          <i class="fas fa-check-circle text-green-500" style="font-size: 6rem;"></i>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-4">تم إرسال التقييم بنجاح!</h1>
        <p class="text-xl text-gray-700 mb-8">شكراً لمشاركتك في تحسين جودة التعليم</p>
        <button 
          onclick="showTeacherSelection()" 
          class="btn-primary text-white px-8 py-3 rounded-lg font-bold text-xl shadow-lg"
        >
          <i class="fas fa-arrow-right ml-2"></i>
          تقييم معلم آخر
        </button>
      </div>
    </div>
  `;
  
  // Clear ratings
  Object.keys(ratings).forEach(key => delete ratings[key]);
}

// ============================================
// Admin Dashboard
// ============================================
function showAdminDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-7xl mx-auto fade-in">
      <!-- Header -->
      <div class="glass-card p-6 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">لوحة الإدارة</h1>
            <p class="text-gray-600 text-lg mt-1">
              <i class="fas fa-user-shield ml-2"></i>
              ${currentUser.full_name}
            </p>
          </div>
          <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
            <i class="fas fa-sign-out-alt ml-2"></i>
            خروج
          </button>
        </div>
      </div>

      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="alert('قريباً')">
          <div class="icon-3d inline-block mb-4">
            <i class="fas fa-chart-bar text-blue-600" style="font-size: 3rem;"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800">التقارير</h3>
        </div>

        <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="alert('قريباً')">
          <div class="icon-3d inline-block mb-4">
            <i class="fas fa-users text-green-600" style="font-size: 3rem;"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800">إدارة الطلاب</h3>
        </div>

        <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="alert('قريباً')">
          <div class="icon-3d inline-block mb-4">
            <i class="fas fa-chalkboard-teacher text-purple-600" style="font-size: 3rem;"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800">إدارة المعلمين</h3>
        </div>

        <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="alert('قريباً')">
          <div class="icon-3d inline-block mb-4">
            <i class="fas fa-cog text-orange-600" style="font-size: 3rem;"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800">الإعدادات</h3>
        </div>
      </div>

      <div class="glass-card p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">قريباً...</h2>
        <p class="text-gray-600 text-lg">
          سيتم إضافة المزيد من الميزات قريباً مثل:
        </p>
        <ul class="list-disc mr-8 mt-4 text-gray-700 space-y-2">
          <li>رفع ملفات Excel للطلاب والمعلمين</li>
          <li>إدارة الأسئلة وتعديل الدرجات</li>
          <li>التقارير التفصيلية والرسوم البيانية</li>
          <li>تصدير التقارير بصيغة PDF</li>
          <li>المقارنات بين المعلمين والفصول</li>
        </ul>
      </div>
    </div>
  `;
}

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginPage();
}
