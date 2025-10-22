/**
 * Hook for managing operation feedback states
 * Implements comprehensive feedback management as per requirement 8.3
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { OmoideError, parseError } from '@/lib/errors'

export interface OperationStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  message?: string
}

export interface OperationFeedbackState {
  isLoading: boolean
  progress: number
  currentStep?: string
  steps: OperationStep[]
  error: OmoideError | null
  success: boolean
  message?: string
}

export interface OperationFeedbackOptions {
  showToasts?: boolean
  autoResetOnSuccess?: boolean
  autoResetDelay?: number
  steps?: Array<{ id: string; label: string }>
}

export function useOperationFeedback(options: OperationFeedbackOptions = {}) {
  const {
    showToasts = true,
    autoResetOnSuccess = false,
    autoResetDelay = 3000,
    steps: initialSteps = []
  } = options

  const { showSuccess, showError, showInfo } = useToast()
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [state, setState] = useState<OperationFeedbackState>({
    isLoading: false,
    progress: 0,
    steps: initialSteps.map(step => ({ ...step, status: 'pending' })),
    error: null,
    success: false
  })

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  const startOperation = useCallback((message?: string) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: null,
      success: false,
      message,
      steps: prev.steps.map(step => ({ ...step, status: 'pending' }))
    }))

    if (showToasts && message) {
      showInfo('開始', message)
    }
  }, [showToasts, showInfo])

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message
    }))
  }, [])

  const setCurrentStep = useCallback((stepId: string, message?: string) => {
    setState(prev => ({
      ...prev,
      currentStep: stepId,
      message,
      steps: prev.steps.map(step => ({
        ...step,
        status: step.id === stepId ? 'active' : 
                step.status === 'active' ? 'pending' : 
                step.status
      }))
    }))
  }, [])

  const completeStep = useCallback((stepId: string, message?: string) => {
    setState(prev => {
      // const stepIndex = prev.steps.findIndex(s => s.id === stepId)
      const completedSteps = prev.steps.filter(s => s.status === 'completed').length + 1
      const totalSteps = prev.steps.length
      const newProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : prev.progress

      return {
        ...prev,
        progress: newProgress,
        message,
        steps: prev.steps.map(step => ({
          ...step,
          status: step.id === stepId ? 'completed' : step.status,
          message: step.id === stepId ? message : step.message
        }))
      }
    })
  }, [])

  const failStep = useCallback((stepId: string, error: OmoideError | Error | unknown) => {
    const omoideError = parseError(error)
    
    setState(prev => ({
      ...prev,
      error: omoideError,
      isLoading: false,
      steps: prev.steps.map(step => ({
        ...step,
        status: step.id === stepId ? 'error' : step.status,
        message: step.id === stepId ? omoideError.userMessage : step.message
      }))
    }))

    if (showToasts) {
      showError('エラー', omoideError.userMessage)
    }
  }, [showToasts, showError])

  const completeOperation = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      success: true,
      message,
      steps: prev.steps.map(step => ({
        ...step,
        status: step.status === 'active' ? 'completed' : step.status
      }))
    }))

    if (showToasts && message) {
      showSuccess('完了', message)
    }

    if (autoResetOnSuccess) {
      resetTimeoutRef.current = setTimeout(() => {
        reset()
      }, autoResetDelay)
    }
  }, [showToasts, showSuccess, autoResetOnSuccess, autoResetDelay])

  const failOperation = useCallback((error: OmoideError | Error | unknown, message?: string) => {
    const omoideError = parseError(error)
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: omoideError,
      message: message || omoideError.userMessage,
      steps: prev.steps.map(step => ({
        ...step,
        status: step.status === 'active' ? 'error' : step.status
      }))
    }))

    if (showToasts) {
      showError('エラー', omoideError.userMessage)
    }
  }, [showToasts, showError])

  const reset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 0,
      currentStep: undefined,
      error: null,
      success: false,
      message: undefined,
      steps: prev.steps.map(step => ({ ...step, status: 'pending', message: undefined }))
    }))
  }, [])

  const addStep = useCallback((step: { id: string; label: string }) => {
    setState(prev => ({
      ...prev,
      steps: [...prev.steps, { ...step, status: 'pending' }]
    }))
  }, [])

  const removeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }, [])

  return {
    ...state,
    startOperation,
    updateProgress,
    setCurrentStep,
    completeStep,
    failStep,
    completeOperation,
    failOperation,
    reset,
    addStep,
    removeStep,
    // Computed properties
    hasSteps: state.steps.length > 0,
    completedSteps: state.steps.filter(s => s.status === 'completed').length,
    totalSteps: state.steps.length,
    canRetry: !!state.error && !state.isLoading
  }
}

export default useOperationFeedback