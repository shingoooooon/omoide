/**
 * Toast notification context for user feedback
 * Implements user-friendly feedback system as per requirements 8.3 and 8.4
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from '@/components/ui/Toast'
import { OmoideError } from '@/lib/errors'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showErrorFromException: (error: OmoideError | Error | unknown) => void
  hideToast: (id: string) => void
  hideAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }, [])

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId()
    const newToast: ToastData = { ...toast, id }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limit the number of toasts
      return updated.slice(0, maxToasts)
    })
  }, [generateId, maxToasts])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const hideAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 4000
    })
  }, [showToast])

  const showError = useCallback((title: string, message?: string) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 6000 // Longer duration for errors
    })
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({
      type: 'warning',
      title,
      message,
      duration: 5000
    })
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({
      type: 'info',
      title,
      message,
      duration: 4000
    })
  }, [showToast])

  const showErrorFromException = useCallback((error: OmoideError | Error | unknown) => {
    if (error instanceof OmoideError) {
      showError('エラーが発生しました', error.userMessage)
    } else if (error instanceof Error) {
      showError('エラーが発生しました', error.message)
    } else {
      showError('エラーが発生しました', '予期しないエラーが発生しました')
    }
  }, [showError])

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showErrorFromException,
    hideToast,
    hideAllToasts
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            isVisible={true}
            onClose={hideToast}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider