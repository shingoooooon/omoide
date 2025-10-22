/**
 * Hook for handling async operations with comprehensive error handling and loading states
 * Implements loading states and error handling as per requirements 8.3 and 2.4
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { OmoideError, parseError, shouldRetry, incrementRetryCount, getRetryDelay } from '@/lib/errors'

export interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: OmoideError | null
  progress?: number
  retryCount: number
}

export interface AsyncOperationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: OmoideError) => void
  onProgress?: (progress: number) => void
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  resetOnExecute?: boolean
}

export function useAsyncOperation<T = any>(
  options: AsyncOperationOptions = {}
) {
  const {
    onSuccess,
    onError,
    onProgress,
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    resetOnExecute = true
  } = options

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    progress: undefined,
    retryCount: 0
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const execute = useCallback(async (
    operation: (signal?: AbortSignal, updateProgress?: (progress: number) => void) => Promise<T>
  ): Promise<T | null> => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Reset state if requested
    if (resetOnExecute) {
      setState(prev => ({
        ...prev,
        data: null,
        error: null,
        progress: undefined,
        retryCount: 0
      }))
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    // Set loading state
    setState(prev => ({ ...prev, loading: true }))

    const updateProgress = (progress: number) => {
      setState(prev => ({ ...prev, progress }))
      onProgress?.(progress)
    }

    try {
      const result = await operation(signal, updateProgress)
      
      // Check if operation was aborted
      if (signal.aborted) {
        return null
      }

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        progress: 100
      }))

      onSuccess?.(result)
      return result

    } catch (error) {
      // Check if operation was aborted
      if (signal.aborted) {
        return null
      }

      const omoideError = parseError(error)
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: omoideError,
        retryCount: prev.retryCount + 1
      }))

      onError?.(omoideError)

      // Auto retry if enabled and error is retryable
      if (autoRetry && shouldRetry(omoideError) && state.retryCount < maxRetries) {
        const delay = getRetryDelay(state.retryCount)
        
        retryTimeoutRef.current = setTimeout(() => {
          execute(operation)
        }, delay)
      }

      return null
    }
  }, [onSuccess, onError, onProgress, autoRetry, maxRetries, retryDelay, resetOnExecute, state.retryCount])

  const retry = useCallback(() => {
    if (state.error && shouldRetry(state.error)) {
      setState(prev => ({
        ...prev,
        error: null,
        loading: false
      }))
    }
  }, [state.error])

  const reset = useCallback(() => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    setState({
      data: null,
      loading: false,
      error: null,
      progress: undefined,
      retryCount: 0
    })
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [])

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel,
    canRetry: state.error ? shouldRetry(state.error) : false,
    isRetrying: !!retryTimeoutRef.current
  }
}

/**
 * Hook for handling multiple async operations
 */
export function useAsyncOperations<T extends Record<string, any>>(
  operations: Record<keyof T, AsyncOperationOptions> = {} as any
) {
  const [states, setStates] = useState<Record<keyof T, AsyncOperationState<any>>>(() => {
    const initialStates = {} as Record<keyof T, AsyncOperationState<any>>
    Object.keys(operations).forEach(key => {
      initialStates[key] = {
        data: null,
        loading: false,
        error: null,
        progress: undefined,
        retryCount: 0
      }
    })
    return initialStates
  })

  const execute = useCallback(async <K extends keyof T>(
    key: K,
    operation: (signal?: AbortSignal, updateProgress?: (progress: number) => void) => Promise<T[K]>
  ): Promise<T[K] | null> => {
    const options = operations[key] || {}
    
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        loading: true,
        error: null,
        progress: undefined
      }
    }))

    try {
      const result = await operation(
        undefined,
        (progress: number) => {
          setStates(prev => ({
            ...prev,
            [key]: { ...prev[key], progress }
          }))
          options.onProgress?.(progress)
        }
      )

      setStates(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          data: result,
          loading: false,
          progress: 100
        }
      }))

      options.onSuccess?.(result)
      return result

    } catch (error) {
      const omoideError = parseError(error)
      
      setStates(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
          error: omoideError,
          retryCount: prev[key].retryCount + 1
        }
      }))

      options.onError?.(omoideError)
      return null
    }
  }, [operations])

  const reset = useCallback(<K extends keyof T>(key?: K) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: {
          data: null,
          loading: false,
          error: null,
          progress: undefined,
          retryCount: 0
        }
      }))
    } else {
      setStates(prev => {
        const resetStates = {} as Record<keyof T, AsyncOperationState<any>>
        Object.keys(prev).forEach(k => {
          resetStates[k as keyof T] = {
            data: null,
            loading: false,
            error: null,
            progress: undefined,
            retryCount: 0
          }
        })
        return resetStates
      })
    }
  }, [])

  const getState = useCallback(<K extends keyof T>(key: K) => {
    return states[key]
  }, [states])

  const isAnyLoading = Object.values(states).some(state => state.loading)
  const hasAnyError = Object.values(states).some(state => state.error)

  return {
    states,
    execute,
    reset,
    getState,
    isAnyLoading,
    hasAnyError
  }
}

export default useAsyncOperation