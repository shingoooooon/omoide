import { trackError } from './analytics'

export interface ErrorInfo {
  id: string
  message: string
  stack?: string
  timestamp: number
  url: string
  userAgent: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'api' | 'network' | 'face_detection' | 'ui' | 'auth' | 'storage' | 'general'
  metadata?: Record<string, any>
}

class ErrorTracker {
  private errors: ErrorInfo[] = []
  private maxErrors = 50 // Keep last 50 errors in memory

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeGlobalErrorHandlers()
    }
  }

  private initializeGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(
        new Error(event.message),
        'critical',
        'general',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: 'global_error_handler'
        }
      )
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      this.captureError(
        error,
        'high',
        'general',
        {
          source: 'unhandled_promise_rejection'
        }
      )
    })
  }

  /**
   * Capture and track an error
   */
  captureError(
    error: Error,
    severity: ErrorInfo['severity'] = 'medium',
    category: ErrorInfo['category'] = 'general',
    metadata?: Record<string, any>
  ): string {
    const errorId = this.generateErrorId()
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      severity,
      category,
      metadata
    }

    // Store error locally
    this.errors.push(errorInfo)
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Track to analytics
    if (category === 'api' || category === 'network' || category === 'face_detection' || category === 'general') {
      trackError(category, error, {
        error_id: errorId,
        severity,
        ...metadata
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 Error [${severity}] [${category}]:`, error.message, metadata)
      if (error.stack) {
        console.error(error.stack)
      }
    }

    // Send to external error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorInfo)
    }

    return errorId
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendToExternalService(errorInfo: ErrorInfo) {
    try {
      // In a real application, you would send this to a service like Sentry, LogRocket, etc.
      // For now, we'll just log it
      console.log('Sending error to external service:', errorInfo.id)
      
      // Example: Send to your own error logging endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo)
      // })
    } catch (sendError) {
      console.error('Failed to send error to external service:', sendError)
    }
  }

  /**
   * Capture API errors
   */
  captureApiError(
    endpoint: string,
    error: Error,
    statusCode?: number,
    metadata?: Record<string, any>
  ): string {
    return this.captureError(
      error,
      statusCode && statusCode >= 500 ? 'high' : 'medium',
      'api',
      {
        endpoint,
        status_code: statusCode,
        ...metadata
      }
    )
  }

  /**
   * Capture network errors
   */
  captureNetworkError(
    url: string,
    error: Error,
    metadata?: Record<string, any>
  ): string {
    return this.captureError(
      error,
      'medium',
      'network',
      {
        url,
        ...metadata
      }
    )
  }

  /**
   * Capture face detection errors
   */
  captureFaceDetectionError(
    error: Error,
    imageUrl?: string,
    metadata?: Record<string, any>
  ): string {
    return this.captureError(
      error,
      'low',
      'face_detection',
      {
        image_url: imageUrl,
        ...metadata
      }
    )
  }

  /**
   * Capture authentication errors
   */
  captureAuthError(
    error: Error,
    action: string,
    metadata?: Record<string, any>
  ): string {
    return this.captureError(
      error,
      'high',
      'auth',
      {
        auth_action: action,
        ...metadata
      }
    )
  }

  /**
   * Capture storage errors
   */
  captureStorageError(
    error: Error,
    operation: string,
    metadata?: Record<string, any>
  ): string {
    return this.captureError(
      error,
      'medium',
      'storage',
      {
        storage_operation: operation,
        ...metadata
      }
    )
  }

  /**
   * Capture UI errors
   */
  captureUIError(
    error: Error,
    component: string,
    metadata?: Record<string, any>
  ): string {
    return this.captureError(
      error,
      'low',
      'ui',
      {
        component,
        ...metadata
      }
    )
  }

  /**
   * Get all captured errors
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorInfo['category']): ErrorInfo[] {
    return this.errors.filter(error => error.category === category)
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.errors.filter(error => error.severity === severity)
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { total: number; by_severity: Record<string, number>; by_category: Record<string, number> } {
    const stats = {
      total: this.errors.length,
      by_severity: {} as Record<string, number>,
      by_category: {} as Record<string, number>
    }

    this.errors.forEach(error => {
      stats.by_severity[error.severity] = (stats.by_severity[error.severity] || 0) + 1
      stats.by_category[error.category] = (stats.by_category[error.category] || 0) + 1
    })

    return stats
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = []
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, userInfo?: Record<string, any>) {
    // Store user context for future error reports
    if (typeof window !== 'undefined') {
      (window as any).__errorTrackerUserContext = {
        userId,
        ...userInfo
      }
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🍞 Breadcrumb [${category}]: ${message}`, data)
    }
    
    // In production, you would send this to your error tracking service
    // This helps with debugging by providing context leading up to errors
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker()

// Convenience functions
export const captureError = (
  error: Error,
  severity?: ErrorInfo['severity'],
  category?: ErrorInfo['category'],
  metadata?: Record<string, any>
) => errorTracker.captureError(error, severity, category, metadata)

export const captureApiError = (
  endpoint: string,
  error: Error,
  statusCode?: number,
  metadata?: Record<string, any>
) => errorTracker.captureApiError(endpoint, error, statusCode, metadata)

export const captureNetworkError = (
  url: string,
  error: Error,
  metadata?: Record<string, any>
) => errorTracker.captureNetworkError(url, error, metadata)

export const captureFaceDetectionError = (
  error: Error,
  imageUrl?: string,
  metadata?: Record<string, any>
) => errorTracker.captureFaceDetectionError(error, imageUrl, metadata)

export const captureAuthError = (
  error: Error,
  action: string,
  metadata?: Record<string, any>
) => errorTracker.captureAuthError(error, action, metadata)

export const captureStorageError = (
  error: Error,
  operation: string,
  metadata?: Record<string, any>
) => errorTracker.captureStorageError(error, operation, metadata)

export const captureUIError = (
  error: Error,
  component: string,
  metadata?: Record<string, any>
) => errorTracker.captureUIError(error, component, metadata)

export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) =>
  errorTracker.addBreadcrumb(message, category, data)