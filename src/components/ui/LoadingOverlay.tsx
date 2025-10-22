/**
 * Loading overlay component for full-screen loading states
 * Implements comprehensive loading feedback as per requirement 8.3
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'
import { ProgressIndicator } from './ProgressIndicator'

interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  message?: string
  progress?: number
  showProgress?: boolean
  variant?: 'spinner' | 'progress' | 'steps'
  steps?: Array<{
    label: string
    status: 'pending' | 'active' | 'completed' | 'error'
  }>
  className?: string
  backdrop?: 'blur' | 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingOverlay({
  isVisible,
  title = '処理中...',
  message,
  progress,
  showProgress = false,
  variant = 'spinner',
  steps,
  className,
  backdrop = 'blur',
  size = 'md'
}: LoadingOverlayProps) {
  if (!isVisible) return null

  const backdropClasses = {
    blur: 'backdrop-blur-sm bg-white/80',
    dark: 'bg-black/50',
    light: 'bg-white/90'
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        backdropClasses[backdrop],
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      aria-describedby="loading-message"
    >
      <div
        className={cn(
          'w-full rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6 text-center',
          sizeClasses[size]
        )}
      >
        {/* Loading Content */}
        <div className="space-y-4">
          {/* Title */}
          <h2
            id="loading-title"
            className="text-lg font-semibold text-neutral-900"
          >
            {title}
          </h2>

          {/* Loading Indicator */}
          {variant === 'spinner' && (
            <LoadingSpinner size="lg" className="mx-auto" />
          )}

          {variant === 'progress' && (
            <div className="space-y-3">
              <LoadingSpinner size="md" className="mx-auto" />
              {(showProgress || progress !== undefined) && (
                <ProgressIndicator
                  progress={progress || 0}
                  showPercentage={showProgress}
                  size="md"
                />
              )}
            </div>
          )}

          {variant === 'steps' && steps && (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  <div className="flex-shrink-0">
                    <StepIcon status={step.status} stepNumber={index + 1} />
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'completed' ? 'text-success-700' :
                      step.status === 'active' ? 'text-primary-700' :
                      step.status === 'error' ? 'text-error-700' :
                      'text-neutral-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          {message && (
            <p
              id="loading-message"
              className="text-sm text-neutral-600 leading-relaxed"
            >
              {message}
            </p>
          )}

          {/* Progress Text */}
          {progress !== undefined && showProgress && (
            <div className="text-xs text-neutral-500">
              {Math.round(progress)}% 完了
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StepIconProps {
  status: 'pending' | 'active' | 'completed' | 'error'
  stepNumber: number
}

function StepIcon({ status, stepNumber }: StepIconProps) {
  const baseClasses = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium'

  switch (status) {
    case 'completed':
      return (
        <div className={cn(baseClasses, 'bg-success-500 text-white')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    
    case 'active':
      return (
        <div className={cn(baseClasses, 'bg-primary-500 text-white')}>
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )
    
    case 'error':
      return (
        <div className={cn(baseClasses, 'bg-error-500 text-white')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    
    default: // pending
      return (
        <div className={cn(baseClasses, 'bg-neutral-200 text-neutral-500')}>
          {stepNumber}
        </div>
      )
  }
}

export default LoadingOverlay