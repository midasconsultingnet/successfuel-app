// Application constants and configuration
export const APP_CONFIG = {
  // Application metadata
  NAME: 'SuccessFuel ERP',
  VERSION: '1.0.0',
  DESCRIPTION: 'Cloud-first ERP system built with Tauri and Svelte',
  
  // API configuration
  API: {
    BASE_URL: 'https://successfuel-api.onrender.com/api/v1',
    ROOT_URL: 'https://successfuel-api.onrender.com',
    GRAPHQL_URL: 'https://successfuel-api.onrender.com/graphql',
    HEALTH_CHECK_URL: 'https://successfuel-api.onrender.com/db-check',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  },
  
  // Authentication configuration
  AUTH: {
    TOKEN_KEY: 'authToken',
    REFRESH_TOKEN_KEY: 'refreshToken',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
  },
  
  // Plugin configuration
  PLUGINS: {
    DIRECTORY: 'plugins',
    MANIFEST_FILE: 'manifest.json',
    DEFAULT_PERMISSIONS: ['read', 'write'],
  },
  
  // UI configuration
  UI: {
    THEME: 'default',
    LOCALE: 'en',
    DATE_FORMAT: 'MM/DD/YYYY',
    TIME_FORMAT: 'HH:mm:ss',
  },
  
  // Cache configuration
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_CACHE_SIZE: 100, // Maximum number of cached items
  },
  
  // Security configuration
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// Export specific configuration sections
export const { API, AUTH, PLUGINS, UI, CACHE, SECURITY } = APP_CONFIG;