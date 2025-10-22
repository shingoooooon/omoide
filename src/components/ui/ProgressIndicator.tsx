/**
 * Progress indicator components for showing operation progress
 * Implements progress feedback as per requirement 8.3
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

interface ProgressIndicatorProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'linear' | 'circular'
  className?: string
}

export function ProgressIndicator({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'linear',
  className
}: ProgressIndicatorProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  if (variant === 'circular') {
    return (
      <CircularProgress
        progress={clampedProgress}
        label={label}
        showPercentage={showPercentage}
        size={size}
        className={className}
      />
    )
  }

  return (
    <LinearProgress
      progress={clampedProgress}
      label={label}
      showPercentage={showPercentage}
      size={size}
      className={className}
    />
  )
}

interface LinearProgressProps {
  progress: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function LinearProgress({
  progress,
  label,
  showPercentage,
  size = 'md',
  className
}: LinearProgressProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-neutral-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-neutral-500">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-neutral-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  progress: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function CircularProgress({
  progress,
  label,
  showPercentage,
  size = 'md',
  className
}: CircularProgressProps) {
  const sizeClasses = {
    sm: { container: 'w-12 h-12', svg: 'w-12 h-12', text: 'text-xs' },
    md: { container: 'w-16 h-16', svg: 'w-16 h-16', text: 'text-sm' },
    lg: { container: 'w-24 h-24', svg: 'w-24 h-24', text: 'text-base' }
  }

  const { container, svg, text } = sizeClasses[size]
  const radius = size === 'sm' ? 16 : size === 'md' ? 22 : 34
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <div className={cn('relative', container)}>
        <svg className={cn(svg, 'transform -rotate-90')} viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-neutral-200"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-300 ease-out"
          />
        </svg>
        
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-semibold text-neutral-700', text)}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-sm font-medium text-neutral-700 text-center">
          {label}
        </span>
      )}
    </div>
  )
}

interface StepProgressProps {
  steps: Array<{
    label: string
    status: 'pending' | 'active' | 'completed' | 'error'
  }>
  className?: string
}

export function StepProgress({ steps, className }: StepProgressProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <StepIcon status={step.status} stepNumber={index + 1} />
          </div>
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              step.status === 'completed' ? 'text-success-700' :
              step.status === 'active' ? 'text-primary-700' :
              step.status === 'error' ? 'text-error-700' :
              'text-neutral-500'
            )}>
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

interface StepIconProps {
  status: 'pending' | 'active' | 'completed' | 'error'
  stepNumber: number
}

function StepIcon({ status, stepNumber }: StepIconProps) {
  const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium'

  switch (status) {
    case 'completed':
      return (
        <div className={cn(baseClasses, 'bg-success-500 text-white')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    
    case 'active':
      return (
        <div className={cn(baseClasses, 'bg-primary-500 text-white')}>
          <LoadingSpinner size="sm" className="text-white" />
        </div>
      )
    
    case 'error':
      return (
        <div className={cn(baseClasses, 'bg-error-500 text-white')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

interface MultiStepProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  className?: string
}

export function MultiStepProgress({
  currentStep,
  totalSteps,
  stepLabels,
  className
}: MultiStepProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-neutral-700">
          ステップ {currentStep} / {totalSteps}
        </span>
        <span className="text-sm text-neutral-500">
          {Math.round(progress)}%
        </span>
      </div>
      
      <ProgressIndicator progress={progress} showPercentage={false} />
      
      {stepLabels && (
        <div className="flex justify-between text-xs text-neutral-500">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={cn(
                index < currentStep ? 'text-success-600' :
                index === currentStep - 1 ? 'text-primary-600 font-medium' :
                'text-neutral-400'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProgressIndicator