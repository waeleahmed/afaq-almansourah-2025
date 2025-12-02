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
async function showAdminDashboard() {
  try {
    const statsResponse = await axios.get('/api/admin/stats/overview');
    const stats = statsResponse.data.stats || {};
    
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

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-lg mb-2">إجمالي الطلاب</p>
                <p class="text-4xl font-bold text-blue-600">${stats.totalStudents || 0}</p>
              </div>
              <div class="icon-3d">
                <i class="fas fa-users text-blue-600" style="font-size: 3rem;"></i>
              </div>
            </div>
          </div>

          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-lg mb-2">إجمالي المعلمين</p>
                <p class="text-4xl font-bold text-green-600">${stats.totalTeachers || 0}</p>
              </div>
              <div class="icon-3d">
                <i class="fas fa-chalkboard-teacher text-green-600" style="font-size: 3rem;"></i>
              </div>
            </div>
          </div>

          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-lg mb-2">إجمالي التقييمات</p>
                <p class="text-4xl font-bold text-purple-600">${stats.totalEvaluations || 0}</p>
              </div>
              <div class="icon-3d">
                <i class="fas fa-star text-purple-600" style="font-size: 3rem;"></i>
              </div>
            </div>
          </div>

          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-lg mb-2">التقييمات المكتملة</p>
                <p class="text-4xl font-bold text-orange-600">${stats.completedEvaluations || 0}</p>
              </div>
              <div class="icon-3d">
                <i class="fas fa-check-circle text-orange-600" style="font-size: 3rem;"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Menu Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showReportsPage()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-chart-bar text-blue-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">التقارير والرسوم البيانية</h3>
            <p class="text-gray-600 mt-2 text-sm">عرض التقارير التفصيلية</p>
          </div>

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showCriteriaManagement()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-tasks text-green-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">إدارة معايير التقييم</h3>
            <p class="text-gray-600 mt-2 text-sm">إضافة وتعديل المعايير</p>
          </div>

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showTeachersManagement()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-chalkboard-teacher text-purple-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">إدارة المعلمين</h3>
            <p class="text-gray-600 mt-2 text-sm">عرض وإدارة المعلمين</p>
          </div>

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="alert('قريباً')">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-users text-orange-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">إدارة الطلاب</h3>
            <p class="text-gray-600 mt-2 text-sm">عرض وإدارة الطلاب</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
  }
}

// ============================================
// Criteria Management
// ============================================
async function showCriteriaManagement() {
  try {
    const response = await axios.get('/api/admin/criteria/all');
    const criteria = response.data.criteria || [];
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-6xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">إدارة معايير التقييم</h2>
              <p class="text-gray-600 text-lg mt-1">إضافة وتعديل وحذف معايير التقييم</p>
            </div>
            <div class="flex gap-4">
              <button onclick="showAddCriterionModal()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-plus ml-2"></i>
                إضافة معيار جديد
              </button>
              <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-arrow-right ml-2"></i>
                رجوع
              </button>
            </div>
          </div>
        </div>

        <!-- Criteria Table -->
        <div class="glass-card p-8">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-right py-3 px-4 font-bold text-gray-700">#</th>
                  <th class="text-right py-3 px-4 font-bold text-gray-700">عنوان المعيار</th>
                  <th class="text-right py-3 px-4 font-bold text-gray-700">الوصف</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الدرجة القصوى</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الترتيب</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الحالة</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${criteria.map((criterion, index) => `
                  <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="py-3 px-4">${index + 1}</td>
                    <td class="py-3 px-4 font-semibold">${criterion.title}</td>
                    <td class="py-3 px-4 text-gray-600 text-sm">${criterion.description || '-'}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        ${criterion.max_score}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">${criterion.display_order}</td>
                    <td class="py-3 px-4 text-center">
                      ${criterion.is_active ? 
                        '<span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">نشط</span>' : 
                        '<span class="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">معطل</span>'
                      }
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex justify-center gap-2">
                        <button 
                          onclick='editCriterion(${JSON.stringify(criterion)})' 
                          class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          title="تعديل"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          onclick="editCriterionScore(${criterion.id}, ${criterion.max_score}, '${criterion.title}')" 
                          class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                          title="تعديل الدرجة وإعادة الاحتساب"
                        >
                          <i class="fas fa-calculator"></i>
                        </button>
                        <button 
                          onclick="toggleCriterion(${criterion.id}, ${criterion.is_active ? 0 : 1})" 
                          class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                          title="${criterion.is_active ? 'تعطيل' : 'تفعيل'}"
                        >
                          <i class="fas fa-${criterion.is_active ? 'ban' : 'check'}"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Container -->
      <div id="modalContainer"></div>
    `;
  } catch (error) {
    console.error('Error loading criteria:', error);
  }
}

// Add criterion modal
function showAddCriterionModal() {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">إضافة معيار جديد</h3>
        
        <form id="addCriterionForm" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">عنوان المعيار *</label>
            <input 
              type="text" 
              id="criterionTitle" 
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
              required
            >
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الوصف</label>
            <textarea 
              id="criterionDescription" 
              rows="3"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الدرجة القصوى *</label>
            <input 
              type="number" 
              id="criterionMaxScore" 
              value="10"
              min="1"
              max="100"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
              required
            >
          </div>

          <div class="flex gap-4 mt-6">
            <button 
              type="submit" 
              class="flex-1 btn-primary text-white py-3 rounded-lg font-bold"
            >
              <i class="fas fa-plus ml-2"></i>
              إضافة المعيار
            </button>
            <button 
              type="button" 
              onclick="closeModal()"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('addCriterionForm').addEventListener('submit', handleAddCriterion);
}

// Handle add criterion
async function handleAddCriterion(e) {
  e.preventDefault();
  
  const title = document.getElementById('criterionTitle').value;
  const description = document.getElementById('criterionDescription').value;
  const max_score = parseInt(document.getElementById('criterionMaxScore').value);
  
  try {
    const response = await axios.post('/api/admin/criteria/add', {
      title,
      description,
      max_score
    });
    
    if (response.data.success) {
      alert('تم إضافة المعيار بنجاح!');
      showCriteriaManagement();
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    alert('حدث خطأ في إضافة المعيار');
  }
}

// Edit criterion
function editCriterion(criterion) {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">تعديل المعيار</h3>
        
        <form id="editCriterionForm" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">عنوان المعيار *</label>
            <input 
              type="text" 
              id="editCriterionTitle" 
              value="${criterion.title}"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
              required
            >
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الوصف</label>
            <textarea 
              id="editCriterionDescription" 
              rows="3"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
            >${criterion.description || ''}</textarea>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الدرجة القصوى *</label>
            <input 
              type="number" 
              id="editCriterionMaxScore" 
              value="${criterion.max_score}"
              min="1"
              max="100"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
              required
            >
            <p class="text-sm text-gray-600 mt-1">⚠️ لإعادة احتساب التقييمات، استخدم زر "تعديل الدرجة" من الجدول</p>
          </div>

          <div>
            <label class="flex items-center">
              <input 
                type="checkbox" 
                id="editCriterionActive" 
                ${criterion.is_active ? 'checked' : ''}
                class="ml-2 w-5 h-5"
              >
              <span class="text-gray-700 font-semibold">معيار نشط</span>
            </label>
          </div>

          <div class="flex gap-4 mt-6">
            <button 
              type="submit" 
              class="flex-1 btn-primary text-white py-3 rounded-lg font-bold"
            >
              <i class="fas fa-save ml-2"></i>
              حفظ التعديلات
            </button>
            <button 
              type="button" 
              onclick="closeModal()"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('editCriterionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('editCriterionTitle').value;
    const description = document.getElementById('editCriterionDescription').value;
    const max_score = parseInt(document.getElementById('editCriterionMaxScore').value);
    const is_active = document.getElementById('editCriterionActive').checked;
    
    try {
      const response = await axios.put(`/api/admin/criteria/${criterion.id}`, {
        title,
        description,
        max_score,
        is_active
      });
      
      if (response.data.success) {
        alert('تم تحديث المعيار بنجاح!');
        showCriteriaManagement();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('حدث خطأ في تحديث المعيار');
    }
  });
}

// Edit criterion score and recalculate
function editCriterionScore(id, currentScore, title) {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">تعديل الدرجة وإعادة الاحتساب</h3>
        
        <div class="bg-yellow-50 border-r-4 border-yellow-500 p-4 mb-6">
          <p class="text-yellow-800 font-semibold">⚠️ تنبيه مهم</p>
          <p class="text-yellow-700 mt-2">سيتم إعادة احتساب جميع التقييمات السابقة لهذا المعيار بناءً على النسبة الجديدة.</p>
        </div>

        <div class="mb-6">
          <p class="text-gray-700 mb-2"><strong>المعيار:</strong> ${title}</p>
          <p class="text-gray-700"><strong>الدرجة الحالية:</strong> ${currentScore}</p>
        </div>
        
        <form id="editScoreForm" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">الدرجة القصوى الجديدة *</label>
            <input 
              type="number" 
              id="newMaxScore" 
              value="${currentScore}"
              min="1"
              max="100"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-2xl font-bold text-center"
              required
            >
            <p class="text-sm text-gray-600 mt-2 text-center">
              النسبة: <span id="ratio">1.00</span>x
            </p>
          </div>

          <div class="flex gap-4 mt-6">
            <button 
              type="submit" 
              class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold"
            >
              <i class="fas fa-calculator ml-2"></i>
              تحديث وإعادة الاحتساب
            </button>
            <button 
              type="button" 
              onclick="closeModal()"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const newMaxScoreInput = document.getElementById('newMaxScore');
  const ratioSpan = document.getElementById('ratio');
  
  newMaxScoreInput.addEventListener('input', () => {
    const newScore = parseFloat(newMaxScoreInput.value) || currentScore;
    const ratio = (newScore / currentScore).toFixed(2);
    ratioSpan.textContent = ratio;
  });

  document.getElementById('editScoreForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newScore = parseInt(document.getElementById('newMaxScore').value);
    
    if (!confirm(`هل أنت متأكد من تغيير الدرجة من ${currentScore} إلى ${newScore}؟\nسيتم إعادة احتساب جميع التقييمات السابقة.`)) {
      return;
    }
    
    try {
      const response = await axios.put(`/api/admin/criteria/${id}/score`, {
        max_score: newScore
      });
      
      if (response.data.success) {
        alert('تم تحديث الدرجة وإعادة احتساب جميع التقييمات بنجاح!');
        showCriteriaManagement();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('حدث خطأ في تحديث الدرجة');
    }
  });
}

// Toggle criterion active status
async function toggleCriterion(id, newStatus) {
  try {
    // Get current criterion data
    const response = await axios.get('/api/admin/criteria/all');
    const criterion = response.data.criteria.find(c => c.id === id);
    
    if (!criterion) return;
    
    await axios.put(`/api/admin/criteria/${id}`, {
      title: criterion.title,
      description: criterion.description,
      max_score: criterion.max_score,
      is_active: newStatus
    });
    
    alert(newStatus ? 'تم تفعيل المعيار بنجاح!' : 'تم تعطيل المعيار بنجاح!');
    showCriteriaManagement();
  } catch (error) {
    alert('حدث خطأ في تحديث حالة المعيار');
  }
}

// Close modal
function closeModal(event) {
  if (!event || event.target === event.currentTarget) {
    document.getElementById('modalContainer').innerHTML = '';
  }
}

// ============================================
// Teachers Management
// ============================================
async function showTeachersManagement() {
  try {
    const response = await axios.get('/api/admin/teachers/stats');
    const teachers = response.data.teachers || [];
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-7xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">إدارة المعلمين</h2>
              <p class="text-gray-600 text-lg mt-1">عرض إحصائيات وتقارير المعلمين</p>
            </div>
            <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-arrow-right ml-2"></i>
              رجوع
            </button>
          </div>
        </div>

        <!-- Teachers Table -->
        <div class="glass-card p-8">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-right py-3 px-4 font-bold text-gray-700">اسم المعلم</th>
                  <th class="text-right py-3 px-4 font-bold text-gray-700">المادة</th>
                  <th class="text-right py-3 px-4 font-bold text-gray-700">التخصص</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">عدد التقييمات</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">المتوسط</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${teachers.map(teacher => {
                  const avgScore = teacher.avg_score ? parseFloat(teacher.avg_score).toFixed(2) : '-';
                  const percentage = teacher.avg_score ? ((teacher.avg_score / 10) * 100).toFixed(0) : 0;
                  
                  return `
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="py-3 px-4 font-semibold">${teacher.full_name}</td>
                      <td class="py-3 px-4">${teacher.subject}</td>
                      <td class="py-3 px-4 text-gray-600">${teacher.specialization || '-'}</td>
                      <td class="py-3 px-4 text-center">
                        <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          ${teacher.total_evaluations || 0}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-center">
                        ${teacher.avg_score ? `
                          <div class="flex items-center justify-center gap-2">
                            <span class="font-bold text-lg">${avgScore}/10</span>
                            <span class="text-sm text-gray-600">(${percentage}%)</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                          </div>
                        ` : '<span class="text-gray-400">لا توجد تقييمات</span>'}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button 
                          onclick="showTeacherReport(${teacher.id})" 
                          class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold"
                        >
                          <i class="fas fa-chart-line ml-2"></i>
                          التقرير التفصيلي
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading teachers:', error);
  }
}

// ============================================
// Reports and Charts
// ============================================
async function showReportsPage() {
  try {
    const [subjectStats, classStats, teachersStats] = await Promise.all([
      axios.get('/api/admin/stats/by-subject'),
      axios.get('/api/admin/stats/by-class'),
      axios.get('/api/admin/teachers/stats')
    ]);
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-7xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">التقارير والرسوم البيانية</h2>
              <p class="text-gray-600 text-lg mt-1">عرض الإحصائيات والمقارنات</p>
            </div>
            <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-arrow-right ml-2"></i>
              رجوع
            </button>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- By Subject Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              <i class="fas fa-book ml-2 text-blue-600"></i>
              المقارنة حسب المادة
            </h3>
            <canvas id="subjectChart"></canvas>
          </div>

          <!-- By Class Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              <i class="fas fa-school ml-2 text-green-600"></i>
              المقارنة حسب الفصل
            </h3>
            <canvas id="classChart"></canvas>
          </div>
        </div>

        <!-- Top Teachers -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6">
            <i class="fas fa-trophy ml-2 text-yellow-500"></i>
            أفضل المعلمين تقييماً
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${teachersStats.data.teachers
              .filter(t => t.avg_score)
              .sort((a, b) => b.avg_score - a.avg_score)
              .slice(0, 3)
              .map((teacher, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const colors = ['yellow', 'gray', 'orange'];
                return `
                  <div class="glass-card p-6 text-center hover:shadow-2xl transition-all">
                    <div class="text-6xl mb-4">${medals[index]}</div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">${teacher.full_name}</h4>
                    <p class="text-gray-600 mb-3">${teacher.subject}</p>
                    <div class="text-3xl font-bold text-${colors[index]}-600 mb-2">
                      ${parseFloat(teacher.avg_score).toFixed(2)}/10
                    </div>
                    <p class="text-sm text-gray-600">${teacher.total_evaluations} تقييم</p>
                  </div>
                `;
              }).join('')}
          </div>
        </div>
      </div>
    `;

    // Draw Subject Chart
    const subjectData = subjectStats.data.stats;
    new Chart(document.getElementById('subjectChart'), {
      type: 'bar',
      data: {
        labels: subjectData.map(s => s.subject),
        datasets: [{
          label: 'متوسط التقييم',
          data: subjectData.map(s => parseFloat(s.avg_score || 0).toFixed(2)),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              font: { family: 'Tajawal' }
            }
          },
          x: {
            ticks: {
              font: { family: 'Tajawal' }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { family: 'Tajawal', size: 14 }
            }
          }
        }
      }
    });

    // Draw Class Chart
    const classData = classStats.data.stats;
    new Chart(document.getElementById('classChart'), {
      type: 'bar',
      data: {
        labels: classData.map(c => `${c.grade_level} - ${c.class_name}`),
        datasets: [{
          label: 'متوسط التقييم',
          data: classData.map(c => parseFloat(c.avg_score || 0).toFixed(2)),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              font: { family: 'Tajawal' }
            }
          },
          x: {
            ticks: {
              font: { family: 'Tajawal' }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { family: 'Tajawal', size: 14 }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

// Show teacher detailed report
async function showTeacherReport(teacherId) {
  try {
    const response = await axios.get(`/api/admin/teacher-report/${teacherId}`);
    const { teacher, criteriaStats, classStats } = response.data;
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-6xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">${teacher.full_name}</h2>
              <p class="text-gray-600 text-lg mt-1">
                <i class="fas fa-book ml-2"></i>
                ${teacher.subject} - ${teacher.specialization || 'غير محدد'}
              </p>
            </div>
            <button onclick="showTeachersManagement()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-arrow-right ml-2"></i>
              رجوع
            </button>
          </div>
        </div>

        <!-- Criteria Performance Chart -->
        <div class="glass-card p-6 mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            <i class="fas fa-star ml-2 text-purple-600"></i>
            الأداء حسب المعايير
          </h3>
          <canvas id="criteriaChart"></canvas>
        </div>

        <!-- Class Performance -->
        <div class="glass-card p-6 mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            <i class="fas fa-school ml-2 text-green-600"></i>
            الأداء حسب الفصول
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${classStats.map(cls => {
              const percentage = ((cls.avg_score / 10) * 100).toFixed(0);
              return `
                <div class="glass-card p-6 text-center">
                  <h4 class="text-lg font-bold text-gray-800 mb-3">${cls.class_name}</h4>
                  <div class="text-4xl font-bold text-purple-600 mb-2">
                    ${parseFloat(cls.avg_score).toFixed(2)}/10
                  </div>
                  <p class="text-gray-600 mb-3">${cls.student_count} طالب</p>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Detailed Criteria Table -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            <i class="fas fa-list ml-2 text-blue-600"></i>
            التفاصيل الكاملة للمعايير
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-right py-3 px-4 font-bold text-gray-700">المعيار</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">عدد التقييمات</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">المتوسط</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">النسبة المئوية</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">التقييم</th>
                </tr>
              </thead>
              <tbody>
                ${criteriaStats.map(stat => {
                  const percentage = ((stat.avg_score / stat.max_score) * 100).toFixed(0);
                  let ratingClass = 'bg-red-100 text-red-800';
                  let ratingText = 'ضعيف';
                  
                  if (percentage >= 90) {
                    ratingClass = 'bg-green-100 text-green-800';
                    ratingText = 'ممتاز';
                  } else if (percentage >= 80) {
                    ratingClass = 'bg-blue-100 text-blue-800';
                    ratingText = 'جيد جداً';
                  } else if (percentage >= 70) {
                    ratingClass = 'bg-yellow-100 text-yellow-800';
                    ratingText = 'جيد';
                  } else if (percentage >= 60) {
                    ratingClass = 'bg-orange-100 text-orange-800';
                    ratingText = 'مقبول';
                  }
                  
                  return `
                    <tr class="border-b border-gray-200">
                      <td class="py-3 px-4 font-semibold">${stat.criteria_title}</td>
                      <td class="py-3 px-4 text-center">${stat.evaluation_count}</td>
                      <td class="py-3 px-4 text-center font-bold">${parseFloat(stat.avg_score).toFixed(2)}/${stat.max_score}</td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <span class="font-bold">${percentage}%</span>
                          <div class="w-24 bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class="inline-block ${ratingClass} px-3 py-1 rounded-full font-semibold">
                          ${ratingText}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Draw Criteria Chart
    new Chart(document.getElementById('criteriaChart'), {
      type: 'radar',
      data: {
        labels: criteriaStats.map(s => s.criteria_title),
        datasets: [{
          label: 'التقييم',
          data: criteriaStats.map(s => parseFloat(s.avg_score)),
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              font: { family: 'Tajawal' }
            },
            pointLabels: {
              font: { family: 'Tajawal', size: 12 }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { family: 'Tajawal', size: 14 }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading teacher report:', error);
  }
}

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginPage();
}
