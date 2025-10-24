'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime?: number;
}

interface UsePerformanceMonitorOptions {
  trackInteractions?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  componentName?: string;
}

export function usePerformanceMonitor({
  trackInteractions = false,
  onMetrics,
  componentName = 'Component',
}: UsePerformanceMonitorOptions = {}) {
  const startTimeRef = useRef<number>(performance.now());
  const renderStartRef = useRef<number>(performance.now());
  const interactionStartRef = useRef<number | null>(null);

  // Track component mount and render performance
  useEffect(() => {
    const loadTime = performance.now() - startTimeRef.current;
    const renderTime = performance.now() - renderStartRef.current;

    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime,
    };

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        loadTime: `${loadTime.toFixed(2)}ms`,
        renderTime: `${renderTime.toFixed(2)}ms`,
      });
    }

    onMetrics?.(metrics);
  }, [componentName, onMetrics]);

  // Track user interactions
  const trackInteraction = useCallback((interactionName: string) => {
    if (!trackInteractions) return;

    const startTime = performance.now();
    interactionStartRef.current = startTime;

    return () => {
      if (interactionStartRef.current) {
        const interactionTime = performance.now() - interactionStartRef.current;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${componentName} - ${interactionName}:`, {
            interactionTime: `${interactionTime.toFixed(2)}ms`,
          });
        }

        onMetrics?.({
          loadTime: 0,
          renderTime: 0,
          interactionTime,
        });
      }
    };
  }, [trackInteractions, componentName, onMetrics]);

  // Measure Core Web Vitals
  const measureWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] FID: ${fid.toFixed(2)}ms`);
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  return {
    trackInteraction,
    measureWebVitals,
  };
}

// Hook for measuring specific operations
export function useOperationTimer() {
  const timersRef = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((operationName: string) => {
    timersRef.current.set(operationName, performance.now());
  }, []);

  const endTimer = useCallback((operationName: string) => {
    const startTime = timersRef.current.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      timersRef.current.delete(operationName);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Timer] ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }, []);

  return { startTimer, endTimer };
}

// Hook for monitoring memory usage
export function useMemoryMonitor() {
  const checkMemoryUsage = useCallback(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[Memory]', usage);
    }

    return usage;
  }, []);

  return { checkMemoryUsage };
}