// Global state
let currentUser = null;
let currentTeacher = null;
let evaluationCriteria = [];
let settings = {};
let notifications = [];

// ============================================
// Advanced Toast Notification System
// ============================================
class ToastNotification {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  show(options) {
    const {
      title = '',
      message = '',
      type = 'success',
      duration = 5000,
      closable = true
    } = options;

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const titles = {
      success: 'نجح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومة'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title || titles[type]}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      ${closable ? '<div class="toast-close"><i class="fas fa-times"></i></div>' : ''}
    `;

    this.container.appendChild(toast);

    // Add close button functionality
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.remove(toast));
    }

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }

  success(message, title = '') {
    return this.show({ type: 'success', message, title });
  }

  error(message, title = '') {
    return this.show({ type: 'error', message, title });
  }

  warning(message, title = '') {
    return this.show({ type: 'warning', message, title });
  }

  info(message, title = '') {
    return this.show({ type: 'info', message, title });
  }
}

// Create global toast instance
const toast = new ToastNotification();

// Legacy compatibility functions
function showNotification(message, type = 'success') {
  toast.show({ message, type });
}

function notifySuccess(message, title = '') {
  toast.success(message, title);
}

function notifyError(message, title = '') {
  toast.error(message, title);
}

function notifyWarning(message, title = '') {
  toast.warning(message, title);
}

function notifyInfo(message, title = '') {
  toast.info(message, title);
}

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
    <!-- Formal Landing Page -->
    <div class="min-h-screen flex flex-col" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      
      <!-- Header with Logo -->
      <div class="text-center pt-12 pb-6">
        <div class="inline-block mb-4">
          <img src="/static/images/logo.png" alt="شعار المجمع" class="h-32 w-auto mx-auto drop-shadow-2xl" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div style="display:none;" class="bg-white rounded-full p-6 shadow-2xl">
            <i class="fas fa-graduation-cap text-purple-600" style="font-size: 4rem;"></i>
          </div>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">${settings.school_name || 'المجمع التعليمي'}</h1>
        <p class="text-xl md:text-2xl text-white opacity-90 drop-shadow">قسم التقييم والجودة</p>
      </div>

      <!-- Main Message Section -->
      <div class="flex-1 flex items-center justify-center px-4 pb-12">
        <div class="max-w-4xl w-full">
          <!-- Message Card -->
          <div class="glass-card p-8 md:p-12 mb-8">
            <div class="text-center">
              <div class="mb-6">
                <i class="fas fa-comment-dots text-purple-600" style="font-size: 4rem;"></i>
              </div>
              <h2 class="text-3xl md:text-5xl font-bold text-gray-800 mb-8 leading-relaxed">
                صوتك يهمنا، ونحن نقدره، ونسمع لك
              </h2>
              <p class="text-lg md:text-2xl text-gray-600 leading-relaxed">
                نحن ملتزمون بتحسين جودة التعليم من خلال آرائكم الصادقة والمسؤولة
              </p>
            </div>
          </div>

          <!-- Login Button -->
          <div class="text-center">
            <button 
              onclick="showLoginForm()" 
              class="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-purple-600 font-bold py-4 px-8 rounded-full shadow-2xl transform hover:scale-105 transition-all text-xl"
            >
              <i class="fas fa-sign-in-alt"></i>
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center pb-6 text-white opacity-75">
        <p class="text-sm">معلمي 2025 - نظام تقييم المعلمين</p>
        <p class="text-xs mt-1">جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
}

// Show login form modal
function showLoginForm() {
  const app = document.getElementById('app');
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in';
  modal.innerHTML = `
    <div class="glass-card p-8 max-w-md w-full mx-4 slide-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">تسجيل الدخول</h2>
        <button onclick="document.getElementById('loginModal').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
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
          onclick="document.getElementById('loginModal').remove(); showPasswordReset();" 
          class="text-purple-600 hover:text-purple-800 font-semibold text-lg"
        >
          <i class="fas fa-key ml-2"></i>
          نسيت كلمة المرور؟
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Focus on username field
  setTimeout(() => document.getElementById('username').focus(), 100);
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
      
      // Close modal if exists
      const modal = document.getElementById('loginModal');
      if (modal) modal.remove();
      
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

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showTeachersManagementFull()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-chalkboard-teacher text-purple-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">إدارة المعلمين</h3>
            <p class="text-gray-600 mt-2 text-sm">عرض وإدارة المعلمين (CRUD)</p>
          </div>

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showStudentsManagement()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-users text-orange-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">إدارة الطلاب</h3>
            <p class="text-gray-600 mt-2 text-sm">عرض وإدارة الطلاب (CRUD)</p>
          </div>

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showExcelUploadPage()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-file-excel text-emerald-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">رفع ملفات Excel</h3>
            <p class="text-gray-600 mt-2 text-sm">رفع الطلاب والمعلمين بالجملة</p>
          </div>

          <div class="glass-card p-6 text-center hover:shadow-2xl transition-all cursor-pointer" onclick="showSettingsPage()">
            <div class="icon-3d inline-block mb-4">
              <i class="fas fa-cog text-gray-600" style="font-size: 3rem;"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">الإعدادات</h3>
            <p class="text-gray-600 mt-2 text-sm">إعدادات النظام العامة</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
  }
}

// ============================================
// Excel Upload Page
// ============================================
function showExcelUploadPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-6xl mx-auto fade-in">
      <!-- Header -->
      <div class="glass-card p-6 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-800">رفع ملفات Excel</h2>
            <p class="text-gray-600 text-lg mt-1">رفع بيانات الطلاب والمعلمين بشكل جماعي</p>
          </div>
          <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
            <i class="fas fa-arrow-right ml-2"></i>
            رجوع
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="glass-card p-6 mb-8 bg-blue-50 border-2 border-blue-200">
        <h3 class="text-xl font-bold text-blue-800 mb-4">
          <i class="fas fa-info-circle ml-2"></i>
          تعليمات الاستخدام
        </h3>
        <ol class="list-decimal list-inside space-y-2 text-gray-700 text-lg">
          <li><strong>قم بتحميل القالب المناسب</strong> (طلاب أو معلمين) من الأزرار أدناه</li>
          <li><strong>افتح الملف</strong> واحفظه بصيغة Excel (.xlsx)</li>
          <li><strong>احذف البيانات النموذجية</strong> واملأ بيانات طلابك/معلميك الفعلية</li>
          <li><strong>تأكد من عدم تغيير أسماء الأعمدة</strong> في الصف الأول</li>
          <li><strong>احفظ الملف</strong> بعد التعديل</li>
          <li><strong>ارفع الملف</strong> باستخدام الأزرار أدناه</li>
        </ol>
      </div>

      <!-- Students Section -->
      <div class="glass-card p-8 mb-8">
        <div class="flex items-center mb-6">
          <div class="icon-3d">
            <i class="fas fa-users text-blue-600" style="font-size: 2.5rem;"></i>
          </div>
          <div class="mr-4">
            <h3 class="text-2xl font-bold text-gray-800">رفع بيانات الطلاب</h3>
            <p class="text-gray-600 mt-1">قم بتحميل القالب، املأ البيانات، ثم ارفع الملف</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Download Template -->
          <div class="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all">
            <i class="fas fa-download text-blue-600 text-4xl mb-4"></i>
            <h4 class="text-xl font-bold text-gray-800 mb-2">1. تحميل قالب الطلاب</h4>
            <p class="text-gray-600 mb-4 text-sm">قالب Excel جاهز مع التعليمات</p>
            <button onclick="excelHandler.generateStudentsTemplate()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold w-full">
              <i class="fas fa-file-excel ml-2"></i>
              تحميل قالب الطلاب
            </button>
          </div>

          <!-- Upload File -->
          <div class="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-500 transition-all">
            <i class="fas fa-upload text-green-600 text-4xl mb-4"></i>
            <h4 class="text-xl font-bold text-gray-800 mb-2">2. رفع ملف الطلاب</h4>
            <p class="text-gray-600 mb-4 text-sm">اختر ملف Excel بعد تعبئته</p>
            <input type="file" id="studentsFileInput" accept=".xlsx,.xls" class="hidden">
            <button onclick="document.getElementById('studentsFileInput').click()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold w-full mb-3">
              <i class="fas fa-file-upload ml-2"></i>
              اختر ملف Excel
            </button>
            <button onclick="uploadStudentsFile()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold w-full">
              <i class="fas fa-cloud-upload-alt ml-2"></i>
              رفع البيانات
            </button>
            <p id="studentsFileName" class="text-sm text-gray-500 mt-2"></p>
          </div>
        </div>
      </div>

      <!-- Teachers Section -->
      <div class="glass-card p-8">
        <div class="flex items-center mb-6">
          <div class="icon-3d">
            <i class="fas fa-chalkboard-teacher text-purple-600" style="font-size: 2.5rem;"></i>
          </div>
          <div class="mr-4">
            <h3 class="text-2xl font-bold text-gray-800">رفع بيانات المعلمين</h3>
            <p class="text-gray-600 mt-1">قم بتحميل القالب، املأ البيانات، ثم ارفع الملف</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Download Template -->
          <div class="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 transition-all">
            <i class="fas fa-download text-purple-600 text-4xl mb-4"></i>
            <h4 class="text-xl font-bold text-gray-800 mb-2">1. تحميل قالب المعلمين</h4>
            <p class="text-gray-600 mb-4 text-sm">قالب Excel جاهز مع التعليمات</p>
            <button onclick="excelHandler.generateTeachersTemplate()" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold w-full">
              <i class="fas fa-file-excel ml-2"></i>
              تحميل قالب المعلمين
            </button>
          </div>

          <!-- Upload File -->
          <div class="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center hover:border-orange-500 transition-all">
            <i class="fas fa-upload text-orange-600 text-4xl mb-4"></i>
            <h4 class="text-xl font-bold text-gray-800 mb-2">2. رفع ملف المعلمين</h4>
            <p class="text-gray-600 mb-4 text-sm">اختر ملف Excel بعد تعبئته</p>
            <input type="file" id="teachersFileInput" accept=".xlsx,.xls" class="hidden">
            <button onclick="document.getElementById('teachersFileInput').click()" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold w-full mb-3">
              <i class="fas fa-file-upload ml-2"></i>
              اختر ملف Excel
            </button>
            <button onclick="uploadTeachersFile()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold w-full">
              <i class="fas fa-cloud-upload-alt ml-2"></i>
              رفع البيانات
            </button>
            <p id="teachersFileName" class="text-sm text-gray-500 mt-2"></p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners for file inputs
  document.getElementById('studentsFileInput').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'لم يتم اختيار ملف';
    document.getElementById('studentsFileName').textContent = fileName;
  });

  document.getElementById('teachersFileInput').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'لم يتم اختيار ملف';
    document.getElementById('teachersFileName').textContent = fileName;
  });
}

// Upload students file
async function uploadStudentsFile() {
  const fileInput = document.getElementById('studentsFileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    toast.error('يرجى اختيار ملف Excel أولاً');
    return;
  }
  
  console.log('Uploading students file:', file.name);
  const result = await excelHandler.uploadStudents(file);
  console.log('Upload result:', result);
  
  if (result && result.success) {
    // Show success message with details
    toast.success(`تم رفع ${result.inserted} طالب بنجاح${result.skipped > 0 ? `، تم تخطي ${result.skipped}` : ''}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('Errors:', result.errors);
      toast.warning('بعض البيانات تم تخطيها', 'تحقق من وحدة التحكم للتفاصيل');
    }
    
    // Reset file input
    fileInput.value = '';
    document.getElementById('studentsFileName').textContent = '';
    
    // Refresh students list or go to students management page
    setTimeout(() => {
      showStudentsManagement();
    }, 2000);
  }
}

// Upload teachers file
async function uploadTeachersFile() {
  const fileInput = document.getElementById('teachersFileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    toast.error('يرجى اختيار ملف Excel أولاً');
    return;
  }

  const result = await excelHandler.uploadTeachers(file);
  
  if (result && result.success) {
    toast.success(`تم رفع ${result.inserted} معلم بنجاح${result.skipped > 0 ? `، تم تخطي ${result.skipped}` : ''}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('Errors:', result.errors);
      toast.warning('بعض البيانات تم تخطيها', 'تحقق من وحدة التحكم للتفاصيل');
    }
    
    fileInput.value = '';
    document.getElementById('teachersFileName').textContent = '';
    
    // Refresh teachers list or go to teachers management page
    setTimeout(() => {
      showTeachersManagementFull();
    }, 2000);
  }
}

// ============================================
// Settings Page
// ============================================
async function showSettingsPage() {
  try {
    console.log('Loading settings page...');
    const response = await axios.get('/api/settings');
    console.log('Settings API response:', response.data);
    
    if (!response.data.success) {
      toast.error('فشل تحميل الإعدادات من الخادم');
      return;
    }
    
    const settings = response.data.settings || {};
    console.log('Parsed settings:', settings);
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-4xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">إعدادات النظام</h2>
              <p class="text-gray-600 text-lg mt-1">الإعدادات العامة للنظام</p>
            </div>
            <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-arrow-right ml-2"></i>
              رجوع
            </button>
          </div>
        </div>

        <!-- Settings Cards -->
        <div class="space-y-6">
          <!-- School Information -->
          <div class="glass-card p-6">
            <div class="flex items-center mb-4">
              <div class="icon-3d">
                <i class="fas fa-school text-blue-600" style="font-size: 2rem;"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mr-3">معلومات المدرسة</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">اسم المدرسة</p>
                  <p class="text-gray-800 font-bold text-lg">${settings.school_name || 'غير محدد'}</p>
                </div>
                <i class="fas fa-building text-gray-400 text-2xl"></i>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">العام الدراسي</p>
                  <p class="text-gray-800 font-bold text-lg">${settings.academic_year || '2025'}</p>
                </div>
                <i class="fas fa-calendar text-gray-400 text-2xl"></i>
              </div>
            </div>
          </div>

          <!-- System Settings -->
          <div class="glass-card p-6">
            <div class="flex items-center mb-4">
              <div class="icon-3d">
                <i class="fas fa-cog text-purple-600" style="font-size: 2rem;"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mr-3">إعدادات النظام</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">حالة التقييم</p>
                  <p class="text-gray-800 font-bold text-lg">
                    ${settings.evaluation_enabled === 'true' ? 
                      '<span class="text-green-600"><i class="fas fa-check-circle ml-1"></i>مفعّل</span>' : 
                      '<span class="text-red-600"><i class="fas fa-times-circle ml-1"></i>معطّل</span>'
                    }
                  </p>
                </div>
                <i class="fas fa-toggle-${settings.evaluation_enabled === 'true' ? 'on text-green-600' : 'off text-gray-400'} text-3xl"></i>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">الحد الأدنى للتقييمات</p>
                  <p class="text-gray-800 font-bold text-lg">${settings.min_evaluations || '5'} تقييمات</p>
                </div>
                <i class="fas fa-chart-line text-gray-400 text-2xl"></i>
              </div>
            </div>
          </div>

          <!-- Database Information -->
          <div class="glass-card p-6">
            <div class="flex items-center mb-4">
              <div class="icon-3d">
                <i class="fas fa-database text-green-600" style="font-size: 2rem;"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mr-3">معلومات قاعدة البيانات</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">نوع قاعدة البيانات</p>
                  <p class="text-gray-800 font-bold text-lg">Cloudflare D1 SQLite</p>
                </div>
                <i class="fas fa-server text-gray-400 text-2xl"></i>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">اسم قاعدة البيانات</p>
                  <p class="text-gray-800 font-bold text-lg">webapp-production</p>
                </div>
                <i class="fas fa-table text-gray-400 text-2xl"></i>
              </div>
            </div>
          </div>

          <!-- System Information -->
          <div class="glass-card p-6">
            <div class="flex items-center mb-4">
              <div class="icon-3d">
                <i class="fas fa-info-circle text-orange-600" style="font-size: 2rem;"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mr-3">معلومات النظام</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">نسخة النظام</p>
                  <p class="text-gray-800 font-bold text-lg">معلمي 2025 v4.1</p>
                </div>
                <i class="fas fa-tag text-gray-400 text-2xl"></i>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">المنصة</p>
                  <p class="text-gray-800 font-bold text-lg">Cloudflare Pages</p>
                </div>
                <i class="fab fa-cloudflare text-gray-400 text-2xl"></i>
              </div>

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-gray-600 text-sm">إطار العمل</p>
                  <p class="text-gray-800 font-bold text-lg">Hono + TypeScript</p>
                </div>
                <i class="fas fa-code text-gray-400 text-2xl"></i>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div class="flex items-start">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mt-1"></i>
              <div class="mr-3">
                <h4 class="text-yellow-800 font-bold mb-1">ملاحظة</h4>
                <p class="text-yellow-700 text-sm">
                  لتعديل الإعدادات، يرجى تحديث قاعدة البيانات مباشرة أو التواصل مع المطور.
                  الإعدادات الحالية هي للعرض فقط.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading settings:', error);
    if (error.response) {
      toast.error(`خطأ في تحميل الإعدادات: ${error.response.status}`);
    } else if (error.request) {
      toast.error('خطأ في الاتصال بالخادم');
    } else {
      toast.error('حدث خطأ غير متوقع');
    }
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
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">التقارير والرسوم البيانية</h2>
              <p class="text-gray-600 text-lg mt-1">عرض الإحصائيات والمقارنات</p>
            </div>
            <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-arrow-right ml-2"></i>
              رجوع
            </button>
          </div>
          
          <!-- Export Buttons -->
          <div class="flex gap-3 flex-wrap mt-4 pt-4 border-t border-gray-200">
            <button onclick="pdfExporter.exportComprehensiveReport()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              <i class="fas fa-file-pdf ml-2"></i>
              تصدير التقرير الشامل
            </button>
            <button onclick="pdfExporter.exportSubjectComparison()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
              <i class="fas fa-book ml-2"></i>
              تصدير مقارنة المواد
            </button>
            <button onclick="pdfExporter.exportClassComparison()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
              <i class="fas fa-school ml-2"></i>
              تصدير مقارنة الفصول
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
    const { teacher, criteria, classes } = response.data;
    const criteriaStats = criteria || [];
    const classStats = classes || [];
    
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
            <div class="flex gap-4">
              <button onclick="exportTeacherReportPDF(${teacherId}, '${teacher.full_name.replace(/'/g, "\\'")}', '${teacher.subject}')" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-file-pdf ml-2"></i>
                تصدير PDF
              </button>
              <button onclick="showTeachersManagement()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-arrow-right ml-2"></i>
                رجوع
              </button>
            </div>
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
              const avgScore = cls.average_score || 0;
              const percentage = ((avgScore / 10) * 100).toFixed(0);
              return `
                <div class="glass-card p-6 text-center">
                  <h4 class="text-lg font-bold text-gray-800 mb-3">${cls.grade_level} - ${cls.class_name}</h4>
                  <div class="text-4xl font-bold text-purple-600 mb-2">
                    ${parseFloat(avgScore).toFixed(2)}/10
                  </div>
                  <p class="text-gray-600 mb-3">${cls.student_count || 0} طالب</p>
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
                  const avgScore = stat.average_score || 0;
                  const percentage = ((avgScore / stat.max_score) * 100).toFixed(0);
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
                      <td class="py-3 px-4 font-semibold">${stat.title}</td>
                      <td class="py-3 px-4 text-center">${stat.evaluation_count || 0}</td>
                      <td class="py-3 px-4 text-center font-bold">${parseFloat(avgScore).toFixed(2)}/${stat.max_score}</td>
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
        labels: criteriaStats.map(s => s.title),
        datasets: [{
          label: 'التقييم',
          data: criteriaStats.map(s => parseFloat(s.average_score || 0)),
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

// ============================================
// Students Management
// ============================================
async function showStudentsManagement() {
  try {
    const response = await axios.get('/api/admin/students');
    const students = response.data.students || [];
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-7xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">إدارة الطلاب</h2>
              <p class="text-gray-600 text-lg mt-1">عرض وإدارة جميع الطلاب</p>
            </div>
            <div class="flex gap-4">
              <button onclick="showBulkDeleteOptions()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-trash-alt ml-2"></i>
                حذف جماعي
              </button>
              <button onclick="showAddStudentModal()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-plus ml-2"></i>
                إضافة طالب جديد
              </button>
              <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-arrow-right ml-2"></i>
                رجوع
              </button>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <div class="glass-card p-8">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-right py-3 px-4 font-bold text-gray-700">اسم المستخدم</th>
                  <th class="text-right py-3 px-4 font-bold text-gray-700">الاسم الكامل</th>
                  <th class="text-right py-3 px-4 font-bold text-gray-700">الرقم الطلابي</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الصف</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الفصل</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الجنس</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">التقييمات</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(student => `
                  <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="py-3 px-4">${student.username}</td>
                    <td class="py-3 px-4 font-semibold">${student.full_name}</td>
                    <td class="py-3 px-4">${student.student_id || '-'}</td>
                    <td class="py-3 px-4 text-center">${student.grade_level}</td>
                    <td class="py-3 px-4 text-center">${student.class_name}</td>
                    <td class="py-3 px-4 text-center">${student.gender === 'male' ? '👨‍🎓' : '👩‍🎓'}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        ${student.completed_evaluations || 0}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex justify-center gap-2">
                        <button 
                          onclick='showStudentEvaluationsModal(${student.id}, "${student.full_name}")' 
                          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          title="عرض التقييمات"
                        >
                          <i class="fas fa-file-alt"></i>
                        </button>
                        ${student.completed_evaluations > 0 ? `
                        <button 
                          onclick="deleteStudentEvaluations(${student.id}, '${student.full_name}', ${student.completed_evaluations})" 
                          class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                          title="حذف التقييمات"
                        >
                          <i class="fas fa-eraser"></i>
                        </button>
                        ` : ''}
                        <button 
                          onclick='editStudent(${JSON.stringify(student)})' 
                          class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          title="تعديل"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          onclick="deleteStudent(${student.id}, '${student.full_name}')" 
                          class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          title="حذف"
                        >
                          <i class="fas fa-trash"></i>
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
    console.error('Error loading students:', error);
  }
}

// Show add student modal
function showAddStudentModal() {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">إضافة طالب جديد</h3>
        
        <form id="addStudentForm" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">اسم المستخدم *</label>
            <input type="text" id="studentUsername" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">كلمة المرور *</label>
            <input type="password" id="studentPassword" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div class="col-span-2">
            <label class="block text-gray-700 font-semibold mb-2">الاسم الكامل *</label>
            <input type="text" id="studentFullName" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الرقم الطلابي</label>
            <input type="text" id="studentId" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الجنس *</label>
            <select id="studentGender" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">المرحلة الدراسية *</label>
            <input type="text" id="studentGradeLevel" placeholder="مثال: متوسط أول" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الفصل *</label>
            <input type="text" id="studentClassName" placeholder="مثال: 1أ" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
            <input type="email" id="studentEmail" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
            <input type="tel" id="studentPhone" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div class="col-span-2 flex gap-4 mt-6">
            <button type="submit" class="flex-1 btn-primary text-white py-3 rounded-lg font-bold">
              <i class="fas fa-plus ml-2"></i>
              إضافة الطالب
            </button>
            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
      username: document.getElementById('studentUsername').value,
      password: document.getElementById('studentPassword').value,
      full_name: document.getElementById('studentFullName').value,
      student_id: document.getElementById('studentId').value,
      gender: document.getElementById('studentGender').value,
      grade_level: document.getElementById('studentGradeLevel').value,
      class_name: document.getElementById('studentClassName').value,
      email: document.getElementById('studentEmail').value,
      phone: document.getElementById('studentPhone').value
    };
    
    try {
      const response = await axios.post('/api/admin/students', studentData);
      if (response.data.success) {
        alert('تم إضافة الطالب بنجاح!');
        showStudentsManagement();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('حدث خطأ في إضافة الطالب');
    }
  });
}

// Edit student
function editStudent(student) {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">تعديل بيانات الطالب</h3>
        
        <form id="editStudentForm" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">اسم المستخدم *</label>
            <input type="text" id="editStudentUsername" value="${student.username}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">كلمة المرور الجديدة (اتركها فارغة للإبقاء)</label>
            <input type="password" id="editStudentPassword" placeholder="اتركها فارغة إذا لم ترد التغيير" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div class="col-span-2">
            <label class="block text-gray-700 font-semibold mb-2">الاسم الكامل *</label>
            <input type="text" id="editStudentFullName" value="${student.full_name}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الرقم الطلابي</label>
            <input type="text" id="editStudentId" value="${student.student_id || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الجنس *</label>
            <select id="editStudentGender" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              <option value="male" ${student.gender === 'male' ? 'selected' : ''}>ذكر</option>
              <option value="female" ${student.gender === 'female' ? 'selected' : ''}>أنثى</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">المرحلة الدراسية *</label>
            <input type="text" id="editStudentGradeLevel" value="${student.grade_level}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الفصل *</label>
            <input type="text" id="editStudentClassName" value="${student.class_name}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
            <input type="email" id="editStudentEmail" value="${student.email || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
            <input type="tel" id="editStudentPhone" value="${student.phone || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div class="col-span-2 flex gap-4 mt-6">
            <button type="submit" class="flex-1 btn-primary text-white py-3 rounded-lg font-bold">
              <i class="fas fa-save ml-2"></i>
              حفظ التعديلات
            </button>
            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
      username: document.getElementById('editStudentUsername').value,
      password: document.getElementById('editStudentPassword').value,
      full_name: document.getElementById('editStudentFullName').value,
      student_id: document.getElementById('editStudentId').value,
      gender: document.getElementById('editStudentGender').value,
      grade_level: document.getElementById('editStudentGradeLevel').value,
      class_name: document.getElementById('editStudentClassName').value,
      email: document.getElementById('editStudentEmail').value,
      phone: document.getElementById('editStudentPhone').value
    };
    
    try {
      const response = await axios.put(`/api/admin/students/${student.id}`, studentData);
      if (response.data.success) {
        alert('تم تحديث بيانات الطالب بنجاح!');
        showStudentsManagement();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('حدث خطأ في تحديث بيانات الطالب');
    }
  });
}

// Delete student
async function deleteStudent(id, name) {
  if (!confirm(`هل أنت متأكد من حذف الطالب "${name}"؟\nلن تتمكن من التراجع عن هذا الإجراء.`)) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/students/${id}`);
    
    if (response.data.success) {
      toast.success('تم حذف الطالب بنجاح!');
      showStudentsManagement();
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    
    // Check if it's a 400 error with evaluations
    if (error.response && error.response.status === 400 && error.response.data.hasEvaluations) {
      const evalCount = error.response.data.evaluationCount;
      const forceDelete = confirm(
        `⚠️ تحذير: الطالب "${name}" لديه ${evalCount} تقييم!\n\n` +
        `هل تريد حذف الطالب مع جميع تقييماته؟\n` +
        `هذا الإجراء لا يمكن التراجع عنه!`
      );
      
      if (forceDelete) {
        try {
          // Force delete with evaluations
          const forceResponse = await axios.delete(`/api/admin/students/${id}?force=true`);
          if (forceResponse.data.success) {
            toast.success(`تم حذف الطالب و${evalCount} تقييم بنجاح`);
            showStudentsManagement();
          } else {
            toast.error('حدث خطأ في الحذف القسري');
          }
        } catch (forceError) {
          console.error('Error force deleting student:', forceError);
          toast.error('حدث خطأ في الحذف القسري');
        }
      }
    } else {
      // Other errors
      toast.error(error.response?.data?.message || 'حدث خطأ في حذف الطالب');
    }
  }
}

// ============================================
// Teachers Management - Full CRUD
// ============================================
async function showTeachersManagementFull() {
  try {
    const response = await axios.get('/api/admin/teachers');
    const teachers = response.data.teachers || [];
    
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-7xl mx-auto fade-in">
        <!-- Header -->
        <div class="glass-card p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">إدارة المعلمين</h2>
              <p class="text-gray-600 text-lg mt-1">عرض وإدارة جميع المعلمين</p>
            </div>
            <div class="flex gap-4">
              <button onclick="showAddTeacherModal()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-plus ml-2"></i>
                إضافة معلم جديد
              </button>
              <button onclick="showAdminDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
                <i class="fas fa-arrow-right ml-2"></i>
                رجوع
              </button>
            </div>
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
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الرقم الوظيفي</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الجنس</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الفصول</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">التقييمات</th>
                  <th class="text-center py-3 px-4 font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${teachers.map(teacher => `
                  <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="py-3 px-4 font-semibold">${teacher.full_name}</td>
                    <td class="py-3 px-4">${teacher.subject}</td>
                    <td class="py-3 px-4 text-gray-600">${teacher.specialization || '-'}</td>
                    <td class="py-3 px-4 text-center">${teacher.employee_id || '-'}</td>
                    <td class="py-3 px-4 text-center">${teacher.gender === 'male' ? '👨‍🏫' : '👩‍🏫'}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                        ${teacher.classes_count || 0}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        ${teacher.total_evaluations || 0}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex justify-center gap-2">
                        ${teacher.total_evaluations > 0 ? `
                        <button 
                          onclick="deleteTeacherEvaluations(${teacher.id}, '${teacher.full_name}', ${teacher.total_evaluations})" 
                          class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                          title="حذف التقييمات"
                        >
                          <i class="fas fa-eraser"></i>
                        </button>
                        ` : ''}
                        <button 
                          onclick='editTeacher(${JSON.stringify(teacher)})' 
                          class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          title="تعديل"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          onclick="manageTeacherClasses(${teacher.id}, '${teacher.full_name}')" 
                          class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                          title="إدارة الفصول"
                        >
                          <i class="fas fa-school"></i>
                        </button>
                        <button 
                          onclick="deleteTeacher(${teacher.id}, '${teacher.full_name}')" 
                          class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          title="حذف"
                        >
                          <i class="fas fa-trash"></i>
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
    console.error('Error loading teachers:', error);
  }
}

// Show add teacher modal
function showAddTeacherModal() {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">إضافة معلم جديد</h3>
        
        <form id="addTeacherForm" class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-gray-700 font-semibold mb-2">الاسم الكامل *</label>
            <input type="text" id="teacherFullName" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">المادة *</label>
            <input type="text" id="teacherSubject" placeholder="مثال: رياضيات" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">التخصص</label>
            <input type="text" id="teacherSpecialization" placeholder="مثال: رياضيات تطبيقية" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الرقم الوظيفي</label>
            <input type="text" id="teacherEmployeeId" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الجنس *</label>
            <select id="teacherGender" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
            <input type="email" id="teacherEmail" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
            <input type="tel" id="teacherPhone" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div class="col-span-2 flex gap-4 mt-6">
            <button type="submit" class="flex-1 btn-primary text-white py-3 rounded-lg font-bold">
              <i class="fas fa-plus ml-2"></i>
              إضافة المعلم
            </button>
            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('addTeacherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const teacherData = {
      full_name: document.getElementById('teacherFullName').value,
      subject: document.getElementById('teacherSubject').value,
      specialization: document.getElementById('teacherSpecialization').value,
      employee_id: document.getElementById('teacherEmployeeId').value,
      gender: document.getElementById('teacherGender').value,
      email: document.getElementById('teacherEmail').value,
      phone: document.getElementById('teacherPhone').value,
      photo_url: null
    };
    
    try {
      const response = await axios.post('/api/admin/teachers', teacherData);
      if (response.data.success) {
        alert('تم إضافة المعلم بنجاح!');
        showTeachersManagementFull();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('حدث خطأ في إضافة المعلم');
    }
  });
}

// Edit teacher
function editTeacher(teacher) {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
      <div class="glass-card p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">تعديل بيانات المعلم</h3>
        
        <form id="editTeacherForm" class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-gray-700 font-semibold mb-2">الاسم الكامل *</label>
            <input type="text" id="editTeacherFullName" value="${teacher.full_name}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">المادة *</label>
            <input type="text" id="editTeacherSubject" value="${teacher.subject}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">التخصص</label>
            <input type="text" id="editTeacherSpecialization" value="${teacher.specialization || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الرقم الوظيفي</label>
            <input type="text" id="editTeacherEmployeeId" value="${teacher.employee_id || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">الجنس *</label>
            <select id="editTeacherGender" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              <option value="male" ${teacher.gender === 'male' ? 'selected' : ''}>ذكر</option>
              <option value="female" ${teacher.gender === 'female' ? 'selected' : ''}>أنثى</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
            <input type="email" id="editTeacherEmail" value="${teacher.email || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
            <input type="tel" id="editTeacherPhone" value="${teacher.phone || ''}" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none">
          </div>

          <div class="col-span-2 flex gap-4 mt-6">
            <button type="submit" class="flex-1 btn-primary text-white py-3 rounded-lg font-bold">
              <i class="fas fa-save ml-2"></i>
              حفظ التعديلات
            </button>
            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('editTeacherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const teacherData = {
      full_name: document.getElementById('editTeacherFullName').value,
      subject: document.getElementById('editTeacherSubject').value,
      specialization: document.getElementById('editTeacherSpecialization').value,
      employee_id: document.getElementById('editTeacherEmployeeId').value,
      gender: document.getElementById('editTeacherGender').value,
      email: document.getElementById('editTeacherEmail').value,
      phone: document.getElementById('editTeacherPhone').value,
      photo_url: teacher.photo_url
    };
    
    try {
      const response = await axios.put(`/api/admin/teachers/${teacher.id}`, teacherData);
      if (response.data.success) {
        alert('تم تحديث بيانات المعلم بنجاح!');
        showTeachersManagementFull();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('حدث خطأ في تحديث بيانات المعلم');
    }
  });
}

// Delete teacher
async function deleteTeacher(id, name) {
  if (!confirm(`هل أنت متأكد من حذف المعلم "${name}"؟\nلن تتمكن من التراجع عن هذا الإجراء.`)) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/teachers/${id}`);
    
    if (response.data.success) {
      toast.success('تم حذف المعلم بنجاح!');
      showTeachersManagementFull();
    }
  } catch (error) {
    console.error('Error deleting teacher:', error);
    
    // Check if it's a 400 error with evaluations
    if (error.response && error.response.status === 400 && error.response.data.hasEvaluations) {
      const evalCount = error.response.data.evaluationCount;
      const forceDelete = confirm(
        `⚠️ تحذير: المعلم "${name}" لديه ${evalCount} تقييم!\n\n` +
        `هل تريد حذف المعلم مع جميع تقييماته؟\n` +
        `هذا الإجراء لا يمكن التراجع عنه!`
      );
      
      if (forceDelete) {
        try {
          // Force delete with evaluations
          const forceResponse = await axios.delete(`/api/admin/teachers/${id}?force=true`);
          if (forceResponse.data.success) {
            toast.success(`تم حذف المعلم و${evalCount} تقييم بنجاح`);
            showTeachersManagementFull();
          } else {
            toast.error('حدث خطأ في الحذف القسري');
          }
        } catch (forceError) {
          console.error('Error force deleting teacher:', forceError);
          toast.error('حدث خطأ في الحذف القسري');
        }
      }
    } else {
      // Other errors
      toast.error(error.response?.data?.message || 'حدث خطأ في حذف المعلم');
    }
  }
}

// Manage teacher classes
async function manageTeacherClasses(teacherId, teacherName) {
  try {
    const response = await axios.get(`/api/admin/teachers/${teacherId}`);
    const classes = response.data.classes || [];
    
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
        <div class="glass-card p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
          <h3 class="text-2xl font-bold text-gray-800 mb-2">إدارة فصول المعلم</h3>
          <p class="text-gray-600 mb-6">${teacherName}</p>
          
          <!-- Add New Class Assignment -->
          <div class="bg-green-50 p-4 rounded-lg mb-6">
            <h4 class="font-bold text-gray-800 mb-4">تعيين لفصل جديد</h4>
            <form id="assignClassForm" class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-gray-700 font-semibold mb-2">المرحلة *</label>
                <input type="text" id="assignGradeLevel" placeholder="متوسط أول" class="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">الفصل *</label>
                <input type="text" id="assignClassName" placeholder="1أ" class="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">المادة *</label>
                <input type="text" id="assignSubject" placeholder="رياضيات" class="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none" required>
              </div>
              <div class="col-span-3">
                <button type="submit" class="btn-primary text-white px-6 py-2 rounded-lg font-semibold w-full">
                  <i class="fas fa-plus ml-2"></i>
                  إضافة تعيين
                </button>
              </div>
            </form>
          </div>

          <!-- Current Assignments -->
          <h4 class="font-bold text-gray-800 mb-4">التعيينات الحالية</h4>
          <div class="space-y-3">
            ${classes.length > 0 ? classes.map(cls => `
              <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <span class="font-semibold text-gray-800">${cls.grade_level}</span>
                  <span class="text-gray-600 mx-2">-</span>
                  <span class="font-semibold text-gray-800">${cls.class_name}</span>
                  <span class="text-gray-600 mx-2">|</span>
                  <span class="text-purple-600">${cls.subject}</span>
                </div>
                <button 
                  onclick="removeTeacherClass(${teacherId}, ${cls.id}, '${teacherName}')"
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
                >
                  <i class="fas fa-times ml-2"></i>
                  إلغاء
                </button>
              </div>
            `).join('') : '<p class="text-gray-600 text-center py-4">لا توجد تعيينات حالياً</p>'}
          </div>

          <div class="mt-6">
            <button onclick="closeModal()" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('assignClassForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const assignmentData = {
        grade_level: document.getElementById('assignGradeLevel').value,
        class_name: document.getElementById('assignClassName').value,
        subject: document.getElementById('assignSubject').value
      };
      
      try {
        const response = await axios.post(`/api/admin/teachers/${teacherId}/classes`, assignmentData);
        if (response.data.success) {
          alert('تم تعيين المعلم للفصل بنجاح!');
          manageTeacherClasses(teacherId, teacherName);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert('حدث خطأ في تعيين المعلم');
      }
    });
  } catch (error) {
    console.error('Error loading teacher classes:', error);
  }
}

// Remove teacher class
async function removeTeacherClass(teacherId, classId, teacherName) {
  if (!confirm('هل أنت متأكد من إلغاء هذا التعيين؟')) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/teachers/${teacherId}/classes/${classId}`);
    if (response.data.success) {
      alert('تم إلغاء التعيين بنجاح!');
      manageTeacherClasses(teacherId, teacherName);
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    alert('حدث خطأ في إلغاء التعيين');
  }
}

// ============================================
// Student Evaluations Modal
// ============================================
async function showStudentEvaluationsModal(studentId, studentName) {
  try {
    // Get all teachers who were evaluated by this student
    const response = await axios.get(`/api/admin/students/${studentId}/evaluations`);
    
    if (!response.data.success) {
      toast.error('فشل في جلب تقييمات الطالب');
      return;
    }
    
    const evaluations = response.data.evaluations || [];
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-file-alt text-blue-600 ml-2"></i>
            تقييمات الطالب: ${studentName}
          </h3>
          <button 
            onclick="this.closest('.fixed').remove()" 
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        ${evaluations.length > 0 ? `
          <div class="space-y-4">
            ${evaluations.map(eval => `
              <div class="glass-card p-4 flex justify-between items-center">
                <div class="flex-1">
                  <h4 class="font-bold text-lg text-gray-800">${eval.teacher_name}</h4>
                  <p class="text-gray-600">المادة: ${eval.subject}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    <i class="fas fa-star text-yellow-500 ml-1"></i>
                    عدد التقييمات: ${eval.evaluation_count}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button 
                    onclick="pdfExporter.exportStudentEvaluation(${studentId}, ${eval.teacher_id})" 
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    <i class="fas fa-download ml-2"></i>
                    تصدير PDF
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-8">
            <i class="fas fa-exclamation-circle text-gray-400 text-5xl mb-4"></i>
            <p class="text-gray-600 text-lg">لا توجد تقييمات لهذا الطالب حتى الآن</p>
          </div>
        `}
        
        <div class="mt-6 text-center">
          <button 
            onclick="this.closest('.fixed').remove()" 
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            <i class="fas fa-times ml-2"></i>
            إغلاق
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error showing student evaluations:', error);
    toast.error('حدث خطأ في عرض تقييمات الطالب');
  }
}

// ============================================
// PDF Export
// ============================================
// Export teacher report PDF - Use the advanced PDF exporter
async function exportTeacherReportPDF(teacherId, teacherName, subject) {
  await pdfExporter.exportTeacherReport(teacherId);
}

// ============================================
// Evaluation Management
// ============================================

// Delete all evaluations for a student
async function deleteStudentEvaluations(studentId, studentName, evalCount) {
  const confirmMessage = `⚠️ تحذير: هل تريد حذف جميع التقييمات (${evalCount} تقييم) للطالب ${studentName}؟\n\nهذا الإجراء لا يمكن التراجع عنه!`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/students/${studentId}/evaluations`);
    
    if (response.data.success) {
      toast.success(`تم حذف ${response.data.deletedCount} تقييم بنجاح!`);
      showStudentsManagement();
    }
  } catch (error) {
    console.error('Error deleting student evaluations:', error);
    toast.error(error.response?.data?.message || 'حدث خطأ في حذف التقييمات');
  }
}

// Delete all evaluations for a teacher
async function deleteTeacherEvaluations(teacherId, teacherName, evalCount) {
  const confirmMessage = `⚠️ تحذير: هل تريد حذف جميع التقييمات (${evalCount} تقييم) للمعلم ${teacherName}؟\n\nهذا الإجراء لا يمكن التراجع عنه!`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/teachers/${teacherId}/evaluations`);
    
    if (response.data.success) {
      toast.success(`تم حذف ${response.data.deletedCount} تقييم بنجاح!`);
      showTeachersManagementFull();
    }
  } catch (error) {
    console.error('Error deleting teacher evaluations:', error);
    toast.error(error.response?.data?.message || 'حدث خطأ في حذف التقييمات');
  }
}

// ============================================
// Bulk Student Deletion
// ============================================

// Show bulk delete options modal
async function showBulkDeleteOptions() {
  try {
    // Fetch classes and grades
    const [classesRes, gradesRes] = await Promise.all([
      axios.get('/api/admin/students/classes/list'),
      axios.get('/api/admin/students/grades/list')
    ]);
    
    const classes = classesRes.data.classes || [];
    const grades = gradesRes.data.grades || [];
    
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal(event)">
        <div class="glass-card p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">
            <i class="fas fa-trash-alt text-red-500 ml-2"></i>
            حذف طلاب جماعياً
          </h3>
          
          <div class="bg-red-50 border-r-4 border-red-500 p-4 mb-6">
            <p class="text-red-700 font-semibold">
              <i class="fas fa-exclamation-triangle ml-2"></i>
              تحذير: هذا الإجراء سيحذف الطلاب وجميع تقييماتهم بشكل نهائي ولا يمكن التراجع عنه!
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Delete by Class -->
            <div class="border-2 border-gray-300 rounded-lg p-6">
              <h4 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-door-open ml-2"></i>
                حذف فصل كامل
              </h4>
              <p class="text-gray-600 mb-4">اختر الصف والفصل لحذف جميع طلابه</p>
              
              ${classes.length > 0 ? `
                <div class="space-y-3">
                  ${classes.map(cls => `
                    <button 
                      onclick="deleteClassStudents('${cls.grade_level}', '${cls.class_name}', ${cls.student_count})"
                      class="w-full bg-white hover:bg-red-50 border-2 border-gray-300 hover:border-red-500 p-4 rounded-lg text-right transition-all"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="font-bold text-gray-800">${cls.grade_level} - ${cls.class_name}</p>
                          <p class="text-sm text-gray-600">${cls.student_count} طالب</p>
                        </div>
                        <i class="fas fa-trash text-red-500"></i>
                      </div>
                    </button>
                  `).join('')}
                </div>
              ` : '<p class="text-gray-500 text-center">لا توجد فصول</p>'}
            </div>

            <!-- Delete by Grade -->
            <div class="border-2 border-gray-300 rounded-lg p-6">
              <h4 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-layer-group ml-2"></i>
                حذف صف كامل
              </h4>
              <p class="text-gray-600 mb-4">اختر الصف لحذف جميع طلابه من كل الفصول</p>
              
              ${grades.length > 0 ? `
                <div class="space-y-3">
                  ${grades.map(grade => `
                    <button 
                      onclick="deleteGradeStudents('${grade.grade_level}', ${grade.student_count})"
                      class="w-full bg-white hover:bg-red-50 border-2 border-gray-300 hover:border-red-500 p-4 rounded-lg text-right transition-all"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="font-bold text-gray-800">${grade.grade_level}</p>
                          <p class="text-sm text-gray-600">${grade.student_count} طالب</p>
                        </div>
                        <i class="fas fa-trash text-red-500"></i>
                      </div>
                    </button>
                  `).join('')}
                </div>
              ` : '<p class="text-gray-500 text-center">لا توجد صفوف</p>'}
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button onclick="closeModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading bulk delete options:', error);
    toast.error('حدث خطأ في تحميل خيارات الحذف الجماعي');
  }
}

// Delete all students in a class
async function deleteClassStudents(gradeLevel, className, studentCount) {
  const confirmMessage = `⚠️ تحذير خطير!\n\nهل تريد حذف جميع الطلاب (${studentCount} طالب) من:\n${gradeLevel} - ${className}\n\nسيتم حذف:\n• جميع الطلاب\n• جميع تقييماتهم\n\nهذا الإجراء لا يمكن التراجع عنه!\n\nهل أنت متأكد؟`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // Second confirmation
  if (!confirm('تأكيد نهائي: هل أنت متأكد 100% من حذف هذا الفصل؟')) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/students/class/${encodeURIComponent(gradeLevel)}/${encodeURIComponent(className)}`);
    
    if (response.data.success) {
      toast.success(response.data.message);
      closeModal();
      showStudentsManagement();
    }
  } catch (error) {
    console.error('Error deleting class students:', error);
    toast.error(error.response?.data?.message || 'حدث خطأ في حذف طلاب الفصل');
  }
}

// Delete all students in a grade
async function deleteGradeStudents(gradeLevel, studentCount) {
  const confirmMessage = `⚠️ تحذير خطير جداً!\n\nهل تريد حذف جميع الطلاب (${studentCount} طالب) من:\n${gradeLevel}\n(من جميع الفصول)\n\nسيتم حذف:\n• جميع الطلاب في هذا الصف\n• جميع تقييماتهم\n\nهذا الإجراء لا يمكن التراجع عنه!\n\nهل أنت متأكد؟`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // Second confirmation
  if (!confirm('تأكيد نهائي: هل أنت متأكد 100% من حذف هذا الصف بالكامل؟')) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/admin/students/grade/${encodeURIComponent(gradeLevel)}`);
    
    if (response.data.success) {
      toast.success(response.data.message);
      closeModal();
      showStudentsManagement();
    }
  } catch (error) {
    console.error('Error deleting grade students:', error);
    toast.error(error.response?.data?.message || 'حدث خطأ في حذف طلاب الصف');
  }
}

// ============================================
// Logout
// ============================================
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginPage();
}
