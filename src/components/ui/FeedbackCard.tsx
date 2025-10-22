/**
 * Feedback card component for displaying operation results
 * Implements user-friendly feedback as per requirements 8.3 and 8.4
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { LoadingSpinner } from './LoadingSpinner'

export type FeedbackType = 'loading' | 'success' | 'error' | 'warning' | 'info' | 'empty'

interface FeedbackCardProps {
  type: FeedbackType
  title: string
  message?: string
  details?: string
  icon?: React.ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
  }>
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function FeedbackCard({
  type,
  title,
  message,
  details,
  icon,
  actions,
  className,
  showIcon = true,
  size = 'md'
}: FeedbackCardProps) {
  const typeStyles = {
    loading: {
      bg: 'bg-primary-50 border-primary-200',
      title: 'text-primary-800',
      message: 'text-primary-700',
      details: 'text-primary-600',
      iconColor: 'text-primary-500'
    },
    success: {
      bg: 'bg-success-50 border-success-200',
      title: 'text-success-800',
      message: 'text-success-700',
      details: 'text-success-600',
      iconColor: 'text-success-500'
    },
    error: {
      bg: 'bg-error-50 border-error-200',
      title: 'text-error-800',
      message: 'text-error-700',
      details: 'text-error-600',
      iconColor: 'text-error-500'
    },
    warning: {
      bg: 'bg-warning-50 border-warning-200',
      title: 'text-warning-800',
      message: 'text-warning-700',
      details: 'text-warning-600',
      iconColor: 'text-warning-500'
    },
    info: {
      bg: 'bg-secondary-50 border-secondary-200',
      title: 'text-secondary-800',
      message: 'text-secondary-700',
      details: 'text-secondary-600',
      iconColor: 'text-secondary-500'
    },
    empty: {
      bg: 'bg-neutral-50 border-neutral-200',
      title: 'text-neutral-800',
      message: 'text-neutral-600',
      details: 'text-neutral-500',
      iconColor: 'text-neutral-400'
    }
  }

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const styles = typeStyles[type]

  const getDefaultIcon = () => {
    switch (type) {
      case 'loading':
        return <LoadingSpinner size="md" />
      case 'success':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'empty':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border',
        styles.bg,
        sizeClasses[size],
        className
      )}
    >
      <div className="text-center space-y-4">
        {/* Icon */}
        {showIcon && (
          <div className={cn('flex justify-center', styles.iconColor)}>
            {icon || getDefaultIcon()}
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h3 className={cn('text-lg font-semibold', styles.title)}>
            {title}
          </h3>
          
          {message && (
            <p className={cn('text-sm', styles.message)}>
              {message}
            </p>
          )}
          
          {details && (
            <p className={cn('text-xs', styles.details)}>
              {details}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Convenience components for common feedback scenarios
export function LoadingCard({
  title = '処理中...',
  message,
  ...props
}: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard
      type="loading"
      title={title}
      message={message}
      {...props}
    />
  )
}

export function SuccessCard({
  title = '完了しました',
  message,
  ...props
}: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard
      type="success"
      title={title}
      message={message}
      {...props}
    />
  )
}

export function ErrorCard({
  title = 'エラーが発生しました',
  message,
  ...props
}: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard
      type="error"
      title={title}
      message={message}
      {...props}
    />
  )
}

export function EmptyCard({
  title = 'データがありません',
  message,
  ...props
}: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard
      type="empty"
      title={title}
      message={message}
      {...props}
    />
  )
}

export default FeedbackCard