import { analytics } from './firebase'
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics'

// Analytics event types
export interface AnalyticsEvent {
  name: string
  parameters?: Record<string, unknown>
}

// Custom events for Omoide app
export const ANALYTICS_EVENTS = {
  // Photo upload events
  PHOTO_UPLOAD_START: 'photo_upload_start',
  PHOTO_UPLOAD_SUCCESS: 'photo_upload_success',
  PHOTO_UPLOAD_ERROR: 'photo_upload_error',
  
  // AI comment generation events
  COMMENT_GENERATION_START: 'comment_generation_start',
  COMMENT_GENERATION_SUCCESS: 'comment_generation_success',
  COMMENT_GENERATION_ERROR: 'comment_generation_error',
  
  // Storybook events
  STORYBOOK_GENERATION_START: 'storybook_generation_start',
  STORYBOOK_GENERATION_SUCCESS: 'storybook_generation_success',
  STORYBOOK_GENERATION_ERROR: 'storybook_generation_error',
  STORYBOOK_VIEW: 'storybook_view',
  STORYBOOK_PAGE_TURN: 'storybook_page_turn',
  
  // Audio events
  AUDIO_PLAY: 'audio_play',
  AUDIO_PAUSE: 'audio_pause',
  AUDIO_GENERATION_START: 'audio_generation_start',
  AUDIO_GENERATION_SUCCESS: 'audio_generation_success',
  AUDIO_GENERATION_ERROR: 'audio_generation_error',
  
  // Sharing events
  SHARE_LINK_CREATE: 'share_link_create',
  SHARE_LINK_ACCESS: 'share_link_access',
  
  // User engagement
  TIMELINE_VIEW: 'timeline_view',
  RECORD_DETAIL_VIEW: 'record_detail_view',
  
  // Error events
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error',
  FACE_DETECTION_FAILED: 'face_detection_failed',
} as const

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

class AnalyticsService {
  private isEnabled: boolean = false

  constructor() {
    // Enable analytics only in production and when analytics is available
    this.isEnabled = typeof window !== 'undefined' && 
                    analytics !== null && 
                    process.env.NODE_ENV === 'production'
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: AnalyticsEventName, parameters?: Record<string, unknown>) {
    if (!this.isEnabled || !analytics) return

    try {
      logEvent(analytics, eventName, {
        timestamp: new Date().toISOString(),
        ...parameters,
      })
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', eventName, parameters)
      }
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  /**
   * Track photo upload events
   */
  trackPhotoUpload(status: 'start' | 'success' | 'error', metadata?: Record<string, unknown>) {
    const eventMap = {
      start: ANALYTICS_EVENTS.PHOTO_UPLOAD_START,
      success: ANALYTICS_EVENTS.PHOTO_UPLOAD_SUCCESS,
      error: ANALYTICS_EVENTS.PHOTO_UPLOAD_ERROR,
    }
    
    this.trackEvent(eventMap[status], metadata)
  }

  /**
   * Track AI comment generation
   */
  trackCommentGeneration(status: 'start' | 'success' | 'error', metadata?: Record<string, unknown>) {
    const eventMap = {
      start: ANALYTICS_EVENTS.COMMENT_GENERATION_START,
      success: ANALYTICS_EVENTS.COMMENT_GENERATION_SUCCESS,
      error: ANALYTICS_EVENTS.COMMENT_GENERATION_ERROR,
    }
    
    this.trackEvent(eventMap[status], metadata)
  }

  /**
   * Track storybook generation and interaction
   */
  trackStorybook(action: 'generation_start' | 'generation_success' | 'generation_error' | 'view' | 'page_turn', metadata?: Record<string, unknown>) {
    const eventMap = {
      generation_start: ANALYTICS_EVENTS.STORYBOOK_GENERATION_START,
      generation_success: ANALYTICS_EVENTS.STORYBOOK_GENERATION_SUCCESS,
      generation_error: ANALYTICS_EVENTS.STORYBOOK_GENERATION_ERROR,
      view: ANALYTICS_EVENTS.STORYBOOK_VIEW,
      page_turn: ANALYTICS_EVENTS.STORYBOOK_PAGE_TURN,
    }
    
    this.trackEvent(eventMap[action], metadata)
  }

  /**
   * Track audio interactions
   */
  trackAudio(action: 'play' | 'pause' | 'generation_start' | 'generation_success' | 'generation_error', metadata?: Record<string, unknown>) {
    const eventMap = {
      play: ANALYTICS_EVENTS.AUDIO_PLAY,
      pause: ANALYTICS_EVENTS.AUDIO_PAUSE,
      generation_start: ANALYTICS_EVENTS.AUDIO_GENERATION_START,
      generation_success: ANALYTICS_EVENTS.AUDIO_GENERATION_SUCCESS,
      generation_error: ANALYTICS_EVENTS.AUDIO_GENERATION_ERROR,
    }
    
    this.trackEvent(eventMap[action], metadata)
  }

  /**
   * Track sharing events
   */
  trackSharing(action: 'create' | 'access', metadata?: Record<string, unknown>) {
    const eventMap = {
      create: ANALYTICS_EVENTS.SHARE_LINK_CREATE,
      access: ANALYTICS_EVENTS.SHARE_LINK_ACCESS,
    }
    
    this.trackEvent(eventMap[action], metadata)
  }

  /**
   * Track page views and navigation
   */
  trackPageView(pageName: string, metadata?: Record<string, unknown>) {
    this.trackEvent('page_view' as AnalyticsEventName, {
      page_name: pageName,
      ...metadata,
    })
  }

  /**
   * Track errors
   */
  trackError(errorType: 'api' | 'network' | 'face_detection' | 'general', error: Error, metadata?: Record<string, unknown>) {
    const eventMap = {
      api: ANALYTICS_EVENTS.API_ERROR,
      network: ANALYTICS_EVENTS.NETWORK_ERROR,
      face_detection: ANALYTICS_EVENTS.FACE_DETECTION_FAILED,
      general: 'error' as AnalyticsEventName,
    }
    
    this.trackEvent(eventMap[errorType], {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      ...metadata,
    })
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>) {
    if (!this.isEnabled || !analytics) return

    try {
      setUserProperties(analytics, properties)
    } catch (error) {
      console.error('Analytics user properties error:', error)
    }
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    if (!this.isEnabled || !analytics) return

    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.error('Analytics user ID error:', error)
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName: string, value: number, metadata?: Record<string, unknown>) {
    this.trackEvent('performance_metric' as AnalyticsEventName, {
      metric_name: metricName,
      metric_value: value,
      ...metadata,
    })
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, metadata?: Record<string, unknown>) {
    this.trackEvent('user_engagement' as AnalyticsEventName, {
      engagement_action: action,
      ...metadata,
    })
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()

// Convenience functions
export const trackEvent = (eventName: AnalyticsEventName, parameters?: Record<string, unknown>) => 
  analyticsService.trackEvent(eventName, parameters)

export const trackError = (errorType: 'api' | 'network' | 'face_detection' | 'general', error: Error, metadata?: Record<string, unknown>) => 
  analyticsService.trackError(errorType, error, metadata)

export const trackPageView = (pageName: string, metadata?: Record<string, unknown>) => 
  analyticsService.trackPageView(pageName, metadata)

export const trackPerformance = (metricName: string, value: number, metadata?: Record<string, unknown>) => 
  analyticsService.trackPerformance(metricName, value, metadata)