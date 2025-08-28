// Configuration template for Dloziville Ancestry Project
// Copy this file to config.js and update with your actual values

const CONFIG = {
  // Appwrite Configuration
  APPWRITE: {
    ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
    PROJECT_ID: 'your-project-id-here',
    DATABASE_ID: 'your-database-id-here',
    COLLECTIONS: {
      CLAIMS: 'your-claims-collection-id',
      CONSULTATIONS: 'your-consultations-collection-id',
      ANCESTRY: 'your-ancestry-collection-id',
      READING_MATERIAL: 'your-reading-material-collection-id',
      ASSIGNMENTS: 'your-assignments-collection-id',
      USER_PROFILES: 'your-user-profiles-collection-id',
      DOCUMENTS: 'your-documents-collection-id'
    },
    STORAGE: {
      CLAIM_DOCUMENTS: 'your-storage-bucket-id'
    }
  },
  
  // Admin Configuration
  ADMIN: {
    ALLOWED_EMAILS: ['admin@example.com', 'superadmin@example.com'],
    SUPER_ADMIN: 'superadmin@example.com'
  },
  
  // Security Configuration
  SECURITY: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
    RATE_LIMIT: {
      LOGIN: 5, // attempts per 15 minutes
      API: 100 // requests per minute
    }
  },
  
  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
    VIRUS_SCAN_ENABLED: true
  }
};

// Environment-specific overrides
if (typeof window !== 'undefined') {
  // Client-side: Use environment variables if available, fallback to defaults
  CONFIG.APPWRITE.ENDPOINT = window.ENV_APPWRITE_ENDPOINT || CONFIG.APPWRITE.ENDPOINT;
  CONFIG.APPWRITE.PROJECT_ID = window.ENV_APPWRITE_PROJECT_ID || CONFIG.APPWRITE.PROJECT_ID;
  CONFIG.ADMIN.ALLOWED_EMAILS = window.ENV_ADMIN_EMAILS ? window.ENV_ADMIN_EMAILS.split(',') : CONFIG.ADMIN.ALLOWED_EMAILS;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}