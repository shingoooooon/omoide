'use client'

import { Fragment, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  isVisible: boolean
  onClose: (id: string) => void
  duration?: number
}

export function Toast({
  id,
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [id, isVisible, duration, onClose])

  const typeStyles = {
    success: {
      bg: 'bg-success-50 border-success-200',
      icon: 'text-success-500',
      title: 'text-success-800',
      message: 'text-success-600',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    error: {
      bg: 'bg-error-50 border-error-200',
      icon: 'text-error-500',
      title: 'text-error-800',
      message: 'text-error-600',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      bg: 'bg-warning-50 border-warning-200',
      icon: 'text-warning-500',
      title: 'text-warning-800',
      message: 'text-warning-600',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
    },
    info: {
      bg: 'bg-secondary-50 border-secondary-200',
      icon: 'text-secondary-500',
      title: 'text-secondary-800',
      message: 'text-secondary-600',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  }

  const styles = typeStyles[type]

  return (
    <Transition
      show={isVisible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={cn(
        'max-w-sm w-full shadow-large rounded-2xl border pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        styles.bg
      )}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className={cn('h-6 w-6', styles.icon)}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={styles.iconPath} />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={cn('text-sm font-medium', styles.title)}>
                {title}
              </p>
              {message && (
                <p className={cn('mt-1 text-sm', styles.message)}>
                  {message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className={cn(
                  'rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  styles.icon
                )}
                onClick={() => onClose(id)}
              >
                <span className="sr-only">閉じる</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

export default Toast