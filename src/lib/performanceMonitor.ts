import { trackPerformance } from './analytics'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          if (lastEntry) {
            this.recordMetric('LCP', lastEntry.startTime, {
              element: lastEntry.element?.tagName || 'unknown'
            })
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime, {
              eventType: entry.name
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          this.recordMetric('CLS', clsValue)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)

        // Navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.recordMetric('Navigation_Duration', entry.duration)
            this.recordMetric('DOM_Content_Loaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart)
            this.recordMetric('Load_Event', entry.loadEventEnd - entry.loadEventStart)
          })
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)

      } catch (error) {
        console.warn('Performance Observer initialization failed:', error)
      }
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)
    
    // Track to analytics
    trackPerformance(name, value, metadata)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`, metadata)
    }

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { ...metadata, status: 'success' })
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { ...metadata, status: 'error' })
      throw error
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const startTime = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { ...metadata, status: 'success' })
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { ...metadata, status: 'error' })
      throw error
    }
  }

  /**
   * Start a performance timer
   */
  startTimer(name: string): (metadata?: Record<string, any>) => void {
    const startTime = performance.now()
    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, metadata)
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  /**
   * Get average value for a metric
   */
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  /**
   * Monitor API call performance
   */
  async monitorApiCall<T>(
    endpoint: string, 
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return this.measureAsync(`API_${endpoint}`, apiCall, {
      endpoint,
      ...metadata
    })
  }

  /**
   * Monitor image upload performance
   */
  async monitorImageUpload<T>(
    uploadFn: () => Promise<T>,
    fileSize: number,
    metadata?: Record<string, any>
  ): Promise<T> {
    return this.measureAsync('Image_Upload', uploadFn, {
      file_size: fileSize,
      ...metadata
    })
  }

  /**
   * Monitor AI generation performance
   */
  async monitorAIGeneration<T>(
    type: 'comment' | 'storybook' | 'audio' | 'image',
    generationFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return this.measureAsync(`AI_Generation_${type}`, generationFn, {
      generation_type: type,
      ...metadata
    })
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions
export const measureAsync = <T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>) =>
  performanceMonitor.measureAsync(name, fn, metadata)

export const measure = <T>(name: string, fn: () => T, metadata?: Record<string, any>) =>
  performanceMonitor.measure(name, fn, metadata)

export const startTimer = (name: string) => performanceMonitor.startTimer(name)

export const monitorApiCall = <T>(endpoint: string, apiCall: () => Promise<T>, metadata?: Record<string, any>) =>
  performanceMonitor.monitorApiCall(endpoint, apiCall, metadata)