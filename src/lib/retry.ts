/**
 * Retry utilities for handling retryable operations
 * Implements retry logic with exponential backoff as per requirements 2.4 and 8.4
 */

import { OmoideError, shouldRetry, incrementRetryCount, getRetryDelay, logError } from './errors'

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  jitter?: boolean
  onRetry?: (error: OmoideError, attempt: number) => void
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true,
    onRetry
  } = options

  let lastError: OmoideError | null = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      return await operation()
    } catch (error) {
      attempt++
      
      if (error instanceof OmoideError) {
        lastError = error
      } else {
        // Convert to OmoideError for consistent handling
        const { parseError } = await import('./errors')
        lastError = parseError(error)
      }

      // Log the error
      logError(lastError, `Retry attempt ${attempt}`)

      // Check if we should retry
      if (attempt > maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      // Increment retry count
      incrementRetryCount(lastError)

      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt)
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay)
      
      // Add jitter to prevent thundering herd
      if (jitter) {
        delay += Math.random() * 1000
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This should never be reached, but just in case
  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Create a retryable version of an async function
 */
export function makeRetryable<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return withRetry(() => fn(...args), options)
  }
}

/**
 * Retry with custom condition
 */
export async function retryWithCondition<T>(
  operation: () => Promise<T>,
  shouldRetryFn: (error: unknown, attempt: number) => boolean,
  options: Omit<RetryOptions, 'maxRetries'> & { maxRetries: number }
): Promise<T> {
  const { maxRetries, onRetry } = options
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      return await operation()
    } catch (error) {
      attempt++

      if (attempt > maxRetries || !shouldRetryFn(error, attempt)) {
        throw error
      }

      if (onRetry && error instanceof OmoideError) {
        onRetry(error, attempt)
      }

      const delay = getRetryDelay(attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Retry failed')
}

/**
 * Retry for specific error types
 */
export async function retryForErrorTypes<T>(
  operation: () => Promise<T>,
  retryableErrorTypes: string[],
  maxRetries: number = 3
): Promise<T> {
  return retryWithCondition(
    operation,
    (error, attempt) => {
      if (error instanceof OmoideError) {
        return retryableErrorTypes.includes(error.type) && attempt <= maxRetries
      }
      return false
    },
    { maxRetries }
  )
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState(): string {
    return this.state
  }

  reset(): void {
    this.failures = 0
    this.lastFailureTime = 0
    this.state = 'CLOSED'
  }
}