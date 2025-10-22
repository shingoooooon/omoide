/**
 * Error boundary components for catching and handling React errors
 * Implements comprehensive error handling as per requirements 2.4 and 8.4
 */

'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { OmoideError, ErrorType, createError, logError } from '@/lib/errors'

interface ErrorBoundaryState {
  hasError: boolean
  error: OmoideError | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: OmoideError, retry: () => void) => ReactNode
  onError?: (error: OmoideError, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const omoideError = createError(ErrorType.UNKNOWN_ERROR, error)
    return {
      hasError: true,
      error: omoideError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const omoideError = createError(ErrorType.UNKNOWN_ERROR, error, {
      componentStack: errorInfo.componentStack
    })

    logError(omoideError, 'ErrorBoundary')

    this.setState({
      error: omoideError,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(omoideError, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          showDetails={this.props.showDetails}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: OmoideError
  onRetry: () => void
  showDetails?: boolean
}

function ErrorFallback({ error, onRetry, showDetails = false }: ErrorFallbackProps) {
  return (
    <Card className="p-8 text-center border-error-200 bg-error-50 max-w-md mx-auto">
      <div className="text-error-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-error-800 mb-2">
        問題が発生しました
      </h3>

      <p className="text-error-700 mb-6">
        {error.userMessage}
      </p>

      <div className="space-y-3">
        <Button
          onClick={onRetry}
          className="bg-error-600 hover:bg-error-700 text-white"
        >
          もう一度試す
        </Button>

        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-error-300 text-error-700 hover:bg-error-100"
        >
          ページを再読み込み
        </Button>
      </div>

      {showDetails && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-error-600 hover:text-error-800">
            詳細情報を表示
          </summary>
          <div className="mt-2 p-3 bg-error-100 rounded-lg text-xs text-error-800 font-mono">
            <div className="mb-2">
              <strong>エラータイプ:</strong> {error.type}
            </div>
            <div className="mb-2">
              <strong>メッセージ:</strong> {error.message}
            </div>
            <div className="mb-2">
              <strong>発生時刻:</strong> {error.timestamp.toLocaleString('ja-JP')}
            </div>
            {error.details && (
              <div>
                <strong>詳細:</strong>
                <pre className="mt-1 whitespace-pre-wrap">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </Card>
  )
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Async error boundary for handling async errors in components
 */
interface AsyncErrorBoundaryProps extends ErrorBoundaryProps {
  onAsyncError?: (error: OmoideError) => void
}

export function AsyncErrorBoundary({ 
  children, 
  onAsyncError, 
  ...props 
}: AsyncErrorBoundaryProps) {
  const handleAsyncError = React.useCallback((error: OmoideError) => {
    // Force the error boundary to catch the error
    throw error
  }, [])

  // Provide async error handler to children via context
  const contextValue = React.useMemo(() => ({
    handleAsyncError: onAsyncError || handleAsyncError
  }), [onAsyncError, handleAsyncError])

  return (
    <AsyncErrorContext.Provider value={contextValue}>
      <ErrorBoundary {...props}>
        {children}
      </ErrorBoundary>
    </AsyncErrorContext.Provider>
  )
}

// Context for async error handling
const AsyncErrorContext = React.createContext<{
  handleAsyncError: (error: OmoideError) => void
} | null>(null)

export function useAsyncError() {
  const context = React.useContext(AsyncErrorContext)
  return context?.handleAsyncError || ((error: OmoideError) => {
    console.error('Async error:', error)
    throw error
  })
}

export default ErrorBoundary