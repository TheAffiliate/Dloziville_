// Initialize Appwrite client with configuration
const client = new Appwrite.Client()
  .setEndpoint(CONFIG.APPWRITE.ENDPOINT)
  .setProject(CONFIG.APPWRITE.PROJECT_ID);

const account = new Appwrite.Account(client);

// On page load: If already logged in, route by email
account.get()
  .then(user => {
    redirectUser(user.email);
  })
  .catch(() => {
    // Stay on page if no session
  });

// Login handler with enhanced security
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = SecurityManager.sanitizeInput(document.getElementById('email').value.trim().toLowerCase());
  const password = document.getElementById('password').value;

  // Validate input
  if (!SecurityManager.validateEmail(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  // Check rate limiting
  if (securityManager.isRateLimited(email, 'login', CONFIG.SECURITY.RATE_LIMIT.LOGIN, 15 * 60 * 1000)) {
    showError('Too many login attempts. Please try again later.');
    return;
  }

  // Check if account is locked
  if (securityManager.isAccountLocked(email)) {
    showError('Account temporarily locked due to too many failed attempts. Please try again later.');
    return;
  }

  try {
    await account.createEmailSession(email, password);
    const user = await account.get();
    
    // Reset login attempts on successful login
    securityManager.resetLoginAttempts(email);
    
    // Create secure session
    const sessionId = securityManager.createSession(user.$id, {
      email: user.email,
      name: user.name,
      isAdmin: SecurityManager.isAdmin(user.email),
      isSuperAdmin: SecurityManager.isSuperAdmin(user.email)
    });
    
    // Store session ID securely
    sessionStorage.setItem('sessionId', sessionId);
    
    redirectUser(user.email);
  } catch (error) {
    console.error('Login failed:', error);
    
    // Track failed login attempt
    securityManager.trackLoginAttempt(email);
    
    showError('Login failed. Please check your credentials and try again.');
  }
});

// Role-based redirect function with enhanced security
function redirectUser(email) {
  if (SecurityManager.isAdmin(email)) {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'index.html';
  }
}

// Enhanced error display
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-500 text-white p-3 rounded-md mb-4 text-center';
  errorDiv.textContent = message;
  
  const form = document.getElementById('login-form');
  form.insertBefore(errorDiv, form.firstChild);
  
  // Remove error after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}