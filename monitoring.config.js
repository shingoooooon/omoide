// Monitoring configuration for production deployment
module.exports = {
  // Firebase Analytics configuration
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    // Custom events to track
    events: {
      // Photo upload flow
      photo_upload_start: { category: 'engagement', action: 'photo_upload', label: 'start' },
      photo_upload_success: { category: 'engagement', action: 'photo_upload', label: 'success' },
      photo_upload_error: { category: 'error', action: 'photo_upload', label: 'error' },
      
      // AI generation flow
      comment_generation_start: { category: 'ai', action: 'comment_generation', label: 'start' },
      comment_generation_success: { category: 'ai', action: 'comment_generation', label: 'success' },
      comment_generation_error: { category: 'error', action: 'comment_generation', label: 'error' },
      
      storybook_generation_start: { category: 'ai', action: 'storybook_generation', label: 'start' },
      storybook_generation_success: { category: 'ai', action: 'storybook_generation', label: 'success' },
      storybook_generation_error: { category: 'error', action: 'storybook_generation', label: 'error' },
      
      // User engagement
      storybook_view: { category: 'engagement', action: 'storybook', label: 'view' },
      storybook_page_turn: { category: 'engagement', action: 'storybook', label: 'page_turn' },
      audio_play: { category: 'engagement', action: 'audio', label: 'play' },
      
      // Sharing
      share_link_create: { category: 'sharing', action: 'create', label: 'link' },
      share_link_access: { category: 'sharing', action: 'access', label: 'link' },
    }
  },

  // Performance monitoring thresholds
  performance: {
    // Core Web Vitals thresholds (in milliseconds)
    thresholds: {
      LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
      FID: { good: 100, poor: 300 },   // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    },
    
    // API performance thresholds
    api: {
      photo_upload: { good: 5000, poor: 15000 },
      comment_generation: { good: 10000, poor: 30000 },
      storybook_generation: { good: 30000, poor: 60000 },
      audio_generation: { good: 15000, poor: 45000 },
    },
    
    // Resource loading thresholds
    resources: {
      images: { good: 2000, poor: 5000 },
      scripts: { good: 1000, poor: 3000 },
      stylesheets: { good: 500, poor: 1500 },
    }
  },

  // Error tracking configuration
  errorTracking: {
    // Error severity levels
    severity: {
      low: ['face_detection', 'ui'],
      medium: ['api', 'network', 'storage'],
      high: ['auth'],
      critical: ['general']
    },
    
    // Error sampling rates (0-1)
    sampling: {
      development: 1.0,  // Track all errors in development
      production: 0.1    // Sample 10% of errors in production
    },
    
    // Ignore patterns (regex)
    ignore: [
      /Script error/,
      /Non-Error promise rejection captured/,
      /ResizeObserver loop limit exceeded/,
      /Network request failed/
    ]
  },

  // User behavior analytics
  userBehavior: {
    // Session timeout (milliseconds)
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    
    // Events to track automatically
    autoTrack: {
      pageViews: true,
      clicks: true,
      scrollDepth: true,
      timeOnPage: true,
      formInteractions: true
    },
    
    // Scroll depth tracking points (percentages)
    scrollDepthPoints: [25, 50, 75, 90, 100],
    
    // Time on page tracking intervals (seconds)
    timeOnPageIntervals: [10, 30, 60, 120, 300]
  },

  // External monitoring services
  external: {
    // Vercel Analytics
    vercel: {
      enabled: process.env.NODE_ENV === 'production',
      // Automatically enabled for Vercel deployments
    },
    
    // Sentry (if you want to add it later)
    sentry: {
      enabled: false,
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    },
    
    // LogRocket (if you want to add it later)
    logRocket: {
      enabled: false,
      appId: process.env.LOGROCKET_APP_ID
    }
  },

  // Data retention policies
  retention: {
    // How long to keep data in local storage (milliseconds)
    local: {
      errors: 24 * 60 * 60 * 1000,      // 24 hours
      performance: 60 * 60 * 1000,      // 1 hour
      userActions: 2 * 60 * 60 * 1000   // 2 hours
    },
    
    // How long to keep data in Firestore (days)
    firestore: {
      errors: 30,        // 30 days
      performance: 7,    // 7 days
      analytics: 90      // 90 days
    }
  },

  // Privacy and compliance
  privacy: {
    // Anonymize IP addresses
    anonymizeIp: true,
    
    // Respect Do Not Track header
    respectDnt: true,
    
    // Cookie consent (if required)
    requireConsent: false,
    
    // Data to exclude from tracking
    exclude: {
      personalData: true,
      sensitiveUrls: ['/admin', '/api/keys'],
      testUsers: process.env.NODE_ENV === 'development'
    }
  }
}