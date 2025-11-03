import { analyticsService } from './analytics'

interface UserSession {
  sessionId: string
  startTime: number
  lastActivity: number
  pageViews: string[]
  actions: UserAction[]
  deviceInfo: DeviceInfo
}

interface UserAction {
  type: string
  timestamp: number
  data?: Record<string, unknown>
}

interface DeviceInfo {
  userAgent: string
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  language: string
  timezone: string
  isMobile: boolean
  isTablet: boolean
}

class UserBehaviorAnalytics {
  private currentSession: UserSession | null = null
  private sessionTimeout = 30 * 60 * 1000 // 30 minutes
  private isEnabled = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.isEnabled = true
      this.initializeSession()
      this.setupEventListeners()
    }
  }

  private initializeSession() {
    const sessionId = this.generateSessionId()
    const deviceInfo = this.getDeviceInfo()
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: [],
      actions: [],
      deviceInfo
    }

    // Track session start
    analyticsService.trackEvent('session_start' as any, {
      session_id: sessionId,
      device_info: deviceInfo
    })

    // Set user properties
    analyticsService.setUserProperties({
      device_type: deviceInfo.isMobile ? 'mobile' : deviceInfo.isTablet ? 'tablet' : 'desktop',
      screen_resolution: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
      language: deviceInfo.language,
      timezone: deviceInfo.timezone
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bTablet\b)/i.test(userAgent)

    return {
      userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isMobile,
      isTablet
    }
  }

  private setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackAction('page_hidden')
      } else {
        this.trackAction('page_visible')
        this.updateLastActivity()
      }
    })

    // Track mouse/touch interactions
    let interactionTimer: NodeJS.Timeout | null = null
    const trackInteraction = () => {
      if (interactionTimer) clearTimeout(interactionTimer)
      interactionTimer = setTimeout(() => {
        this.updateLastActivity()
      }, 1000)
    }

    document.addEventListener('mousedown', trackInteraction)
    document.addEventListener('touchstart', trackInteraction)
    document.addEventListener('keydown', trackInteraction)
    document.addEventListener('scroll', trackInteraction)

    // Track beforeunload for session end
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })

    // Check for session timeout periodically
    setInterval(() => {
      this.checkSessionTimeout()
    }, 60000) // Check every minute
  }

  private updateLastActivity() {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now()
    }
  }

  private checkSessionTimeout() {
    if (!this.currentSession) return

    const now = Date.now()
    const timeSinceLastActivity = now - this.currentSession.lastActivity

    if (timeSinceLastActivity > this.sessionTimeout) {
      this.endSession()
      this.initializeSession()
    }
  }

  /**
   * Track a user action
   */
  trackAction(type: string, data?: Record<string, unknown>) {
    if (!this.isEnabled || !this.currentSession) return

    const action: UserAction = {
      type,
      timestamp: Date.now(),
      data
    }

    this.currentSession.actions.push(action)
    this.updateLastActivity()

    // Track to analytics
    analyticsService.trackEvent('user_action' as any, {
      session_id: this.currentSession.sessionId,
      action_type: type,
      ...data
    })

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 User Action:', type, data)
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, metadata?: Record<string, unknown>) {
    if (!this.isEnabled || !this.currentSession) return

    this.currentSession.pageViews.push(pageName)
    this.trackAction('page_view', { page_name: pageName, ...metadata })

    analyticsService.trackPageView(pageName, {
      session_id: this.currentSession.sessionId,
      ...metadata
    })
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, unknown>) {
    this.trackAction('feature_usage', {
      feature,
      feature_action: action,
      ...metadata
    })
  }

  /**
   * Track user engagement events
   */
  trackEngagement(engagementType: string, duration?: number, metadata?: Record<string, unknown>) {
    this.trackAction('engagement', {
      engagement_type: engagementType,
      duration,
      ...metadata
    })

    analyticsService.trackEngagement(engagementType, {
      session_id: this.currentSession?.sessionId,
      duration,
      ...metadata
    })
  }

  /**
   * Track conversion events
   */
  trackConversion(conversionType: string, value?: number, metadata?: Record<string, unknown>) {
    this.trackAction('conversion', {
      conversion_type: conversionType,
      value,
      ...metadata
    })

    analyticsService.trackEvent('conversion' as any, {
      session_id: this.currentSession?.sessionId,
      conversion_type: conversionType,
      value,
      ...metadata
    })
  }

  /**
   * Track user flow progression
   */
  trackFlowStep(flowName: string, stepName: string, stepNumber: number, metadata?: Record<string, unknown>) {
    this.trackAction('flow_step', {
      flow_name: flowName,
      step_name: stepName,
      step_number: stepNumber,
      ...metadata
    })
  }

  /**
   * Track search behavior
   */
  trackSearch(query: string, resultsCount: number, metadata?: Record<string, unknown>) {
    this.trackAction('search', {
      search_query: query,
      results_count: resultsCount,
      ...metadata
    })
  }

  /**
   * Track form interactions
   */
  trackFormInteraction(formName: string, action: 'start' | 'complete' | 'abandon', metadata?: Record<string, unknown>) {
    this.trackAction('form_interaction', {
      form_name: formName,
      form_action: action,
      ...metadata
    })
  }

  /**
   * Track button clicks
   */
  trackButtonClick(buttonName: string, location: string, metadata?: Record<string, unknown>) {
    this.trackAction('button_click', {
      button_name: buttonName,
      button_location: location,
      ...metadata
    })
  }

  /**
   * Track time spent on page
   */
  trackTimeOnPage(pageName: string, timeSpent: number, metadata?: Record<string, unknown>) {
    this.trackAction('time_on_page', {
      page_name: pageName,
      time_spent: timeSpent,
      ...metadata
    })
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(pageName: string, maxScrollPercentage: number, metadata?: Record<string, unknown>) {
    this.trackAction('scroll_depth', {
      page_name: pageName,
      max_scroll_percentage: maxScrollPercentage,
      ...metadata
    })
  }

  /**
   * Get current session info
   */
  getCurrentSession(): UserSession | null {
    return this.currentSession
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    if (!this.currentSession) return 0
    return Date.now() - this.currentSession.startTime
  }

  /**
   * End current session
   */
  endSession() {
    if (!this.currentSession) return

    const sessionDuration = this.getSessionDuration()
    
    analyticsService.trackEvent('session_end' as any, {
      session_id: this.currentSession.sessionId,
      session_duration: sessionDuration,
      page_views_count: this.currentSession.pageViews.length,
      actions_count: this.currentSession.actions.length,
      pages_visited: this.currentSession.pageViews
    })

    this.currentSession = null
  }

  /**
   * Set user identifier
   */
  setUserId(userId: string) {
    analyticsService.setUserId(userId)
    
    if (this.currentSession) {
      this.trackAction('user_identified', { user_id: userId })
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>) {
    analyticsService.setUserProperties(properties)
  }
}

// Export singleton instance
export const userBehaviorAnalytics = new UserBehaviorAnalytics()

// Convenience functions
export const trackAction = (type: string, data?: Record<string, unknown>) =>
  userBehaviorAnalytics.trackAction(type, data)

export const trackPageView = (pageName: string, metadata?: Record<string, unknown>) =>
  userBehaviorAnalytics.trackPageView(pageName, metadata)

export const trackFeatureUsage = (feature: string, action: string, metadata?: Record<string, unknown>) =>
  userBehaviorAnalytics.trackFeatureUsage(feature, action, metadata)

export const trackEngagement = (engagementType: string, duration?: number, metadata?: Record<string, unknown>) =>
  userBehaviorAnalytics.trackEngagement(engagementType, duration, metadata)

export const trackConversion = (conversionType: string, value?: number, metadata?: Record<string, unknown>) =>
  userBehaviorAnalytics.trackConversion(conversionType, value, metadata)

export const trackButtonClick = (buttonName: string, location: string, metadata?: Record<string, unknown>) =>
  userBehaviorAnalytics.trackButtonClick(buttonName, location, metadata)