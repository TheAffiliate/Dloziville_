// Security utilities for Dloziville Ancestry Project

class SecurityManager {
  constructor() {
    this.loginAttempts = new Map();
    this.sessions = new Map();
    this.rateLimitStore = new Map();
  }

  // Input validation and sanitization
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
  }

  static validatePassword(password) {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  static validateFileUpload(file) {
    const allowedTypes = CONFIG.UPLOAD.ALLOWED_TYPES;
    const maxSize = CONFIG.UPLOAD.MAX_FILE_SIZE;
    
    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error(`File type ${fileExtension} is not allowed`);
    }
    
    return true;
  }

  // Rate limiting
  isRateLimited(identifier, action, limit, windowMs) {
    const key = `${identifier}:${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, []);
    }
    
    const attempts = this.rateLimitStore.get(key);
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    
    if (recentAttempts.length >= limit) {
      return true;
    }
    
    recentAttempts.push(now);
    this.rateLimitStore.set(key, recentAttempts);
    return false;
  }

  // Login attempt tracking
  trackLoginAttempt(email) {
    const attempts = this.loginAttempts.get(email) || 0;
    this.loginAttempts.set(email, attempts + 1);
    
    if (attempts + 1 >= CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS) {
      setTimeout(() => {
        this.loginAttempts.delete(email);
      }, CONFIG.SECURITY.LOCKOUT_DURATION);
    }
  }

  isAccountLocked(email) {
    const attempts = this.loginAttempts.get(email) || 0;
    return attempts >= CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS;
  }

  resetLoginAttempts(email) {
    this.loginAttempts.delete(email);
  }

  // Session management
  createSession(userId, userData) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId,
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Check if session has expired
    if (Date.now() - session.lastActivity > CONFIG.SECURITY.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    return session;
  }

  destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // Admin validation
  static isAdmin(email) {
    return CONFIG.ADMIN.ALLOWED_EMAILS.includes(email.toLowerCase());
  }

  static isSuperAdmin(email) {
    return email.toLowerCase() === CONFIG.ADMIN.SUPER_ADMIN.toLowerCase();
  }

  // Utility functions
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // CSRF protection
  generateCSRFToken() {
    return 'csrf_' + Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
  }

  validateCSRFToken(token, storedToken) {
    return token === storedToken;
  }
}

// Global security manager instance
const securityManager = new SecurityManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecurityManager, securityManager };
} else if (typeof window !== 'undefined') {
  window.SecurityManager = SecurityManager;
  window.securityManager = securityManager;
}