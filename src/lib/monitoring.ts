// Monitoring initialization and setup
import { analyticsService } from './analytics'
import { performanceMonitor } from './performanceMonitor'
import { errorTracker } from './errorTracking'
import { userBehaviorAnalytics } from './userBehaviorAnalytics'

class MonitoringService {
  private isInitialized = false

  /**
   * Initialize all monitoring services
   */
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      // Initialize services (they auto-initialize, but we can add custom setup here)
      this.setupCustomEventListeners()
      this.setupPerformanceTracking()
      this.setupErrorBoundaries()
      
      this.isInitialized = true
      
      console.log('📊 Monitoring services initialized')
    } catch (error) {
      console.error('Failed to initialize monitoring services:', error)
    }
  }

  private setupCustomEventListeners() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          performanceMonitor.recordMetric('Page_Load_Complete', navigation.loadEventEnd - navigation.loadEventStart)
          performanceMonitor.recordMetric('DOM_Interactive', navigation.domInteractive - navigation.fetchStart)
          performanceMonitor.recordMetric('First_Paint', navigation.responseEnd - navigation.requestStart)
        }
      }, 0)
    })

    // Track visibility changes for engagement
    document.addEventListener('visibilitychange', () => {
      userBehaviorAnalytics.trackAction('visibility_change', {
        hidden: document.hidden
      })
    })

    // Track network status changes
    window.addEventListener('online', () => {
      userBehaviorAnalytics.trackAction('network_status', { status: 'online' })
    })

    window.addEventListener('offline', () => {
      userBehaviorAnalytics.trackAction('network_status', { status: 'offline' })
    })
  }

  private setupPerformanceTracking() {
    // Track resource loading performance
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Track slow resources
          if (resourceEntry.duration > 1000) {
            performanceMonitor.recordMetric('Slow_Resource_Load', resourceEntry.duration, {
              resource_name: resourceEntry.name,
              resource_type: resourceEntry.initiatorType
            })
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Resource performance observer not supported:', error)
    }
  }

  private setupErrorBoundaries() {
    // Additional error tracking for specific scenarios
    
    // Track fetch failures
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        if (!response.ok) {
          errorTracker.captureApiError(
            args[0] as string,
            new Error(`HTTP ${response.status}: ${response.statusText}`),
            response.status
          )
        }
        
        return response
      } catch (error) {
        errorTracker.captureNetworkError(
          args[0] as string,
          error as Error
        )
        throw error
      }
    }
  }

  /**
   * Track custom business events
   */
  trackBusinessEvent(eventName: string, data?: Record<string, unknown>) {
    analyticsService.trackEvent(eventName as never, data)
    userBehaviorAnalytics.trackAction('business_event', {
      event_name: eventName,
      ...data
    })
  }

  /**
   * Track user journey milestones
   */
  trackMilestone(milestone: string, data?: Record<string, unknown>) {
    analyticsService.trackEvent('milestone_reached' as never, {
      milestone,
      ...data
    })
    
    userBehaviorAnalytics.trackConversion('milestone', 1, {
      milestone,
      ...data
    })
  }

  /**
   * Track feature adoption
   */
  trackFeatureAdoption(feature: string, action: 'discovered' | 'first_use' | 'regular_use', data?: Record<string, unknown>) {
    analyticsService.trackEvent('feature_adoption' as never, {
      feature,
      adoption_stage: action,
      ...data
    })
    
    userBehaviorAnalytics.trackFeatureUsage(feature, action, data)
  }

  /**
   * Set user context for all monitoring services
   */
  setUserContext(userId: string, userProperties?: Record<string, unknown>) {
    analyticsService.setUserId(userId)
    analyticsService.setUserProperties(userProperties || {})
    userBehaviorAnalytics.setUserId(userId)
    userBehaviorAnalytics.setUserProperties(userProperties || {})
    errorTracker.setUserContext(userId, userProperties)
  }

  /**
   * Track performance for specific operations
   */
  async trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const timer = performanceMonitor.startTimer(operationName)
    
    try {
      userBehaviorAnalytics.trackAction('operation_start', {
        operation: operationName,
        ...metadata
      })
      
      const result = await operation()
      
      timer({ status: 'success', ...metadata })
      
      userBehaviorAnalytics.trackAction('operation_success', {
        operation: operationName,
        ...metadata
      })
      
      return result
    } catch (error) {
      timer({ status: 'error', ...metadata })
      
      errorTracker.captureError(
        error as Error,
        'medium',
        'general',
        {
          operation: operationName,
          ...metadata
        }
      )
      
      userBehaviorAnalytics.trackAction('operation_error', {
        operation: operationName,
        error_message: (error as Error).message,
        ...metadata
      })
      
      throw error
    }
  }

  /**
   * Get monitoring health status
   */
  getHealthStatus() {
    return {
      initialized: this.isInitialized,
      services: {
        analytics: !!analyticsService,
        performance: !!performanceMonitor,
        errors: !!errorTracker,
        userBehavior: !!userBehaviorAnalytics
      },
      timestamp: Date.now()
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService()

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      monitoringService.initialize()
    })
  } else {
    monitoringService.initialize()
  }
}

// Convenience exports
export const trackBusinessEvent = (eventName: string, data?: Record<string, unknown>) =>
  monitoringService.trackBusinessEvent(eventName, data)

export const trackMilestone = (milestone: string, data?: Record<string, unknown>) =>
  monitoringService.trackMilestone(milestone, data)

export const trackFeatureAdoption = (
  feature: string, 
  action: 'discovered' | 'first_use' | 'regular_use', 
  data?: Record<string, unknown>
) => monitoringService.trackFeatureAdoption(feature, action, data)

export const setUserContext = (userId: string, userProperties?: Record<string, unknown>) =>
  monitoringService.setUserContext(userId, userProperties)

export const trackOperation = <T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
) => monitoringService.trackOperation(operationName, operation, metadata)