/**
 * Enhanced API client with comprehensive error handling and retry logic
 * Implements robust API communication as per requirements 2.4 and 8.4
 */

import { OmoideError, ErrorType, createError, parseError } from './errors'
import { withRetry, RetryOptions } from './retry'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiClientOptions {
  baseUrl?: string
  timeout?: number
  retryOptions?: RetryOptions
  defaultHeaders?: Record<string, string>
}

export class ApiClient {
  private baseUrl: string
  private timeout: number
  private retryOptions: RetryOptions
  private defaultHeaders: Record<string, string>

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.timeout = options.timeout || 30000 // 30 seconds
    this.retryOptions = options.retryOptions || { maxRetries: 3 }
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders
    }
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retryOptions?: RetryOptions
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout)
    }

    const operation = async (): Promise<T> => {
      try {
        const response = await fetch(fullUrl, requestOptions)
        
        if (!response.ok) {
          throw await this.handleHttpError(response)
        }

        const data = await response.json()
        
        // Handle API response format
        if (typeof data === 'object' && 'success' in data) {
          if (!data.success) {
            throw createError(
              ErrorType.UNKNOWN_ERROR,
              data.error || data.message || 'API request failed',
              { response: data }
            )
          }
          return data.data || data
        }

        return data
      } catch (error) {
        if (error instanceof OmoideError) {
          throw error
        }
        
        // Handle different types of errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw createError(ErrorType.NETWORK_ERROR, error)
        }
        
        if (error instanceof DOMException && error.name === 'TimeoutError') {
          throw createError(ErrorType.TIMEOUT_ERROR, error)
        }
        
        throw parseError(error)
      }
    }

    return withRetry(operation, retryOptions || this.retryOptions)
  }

  private async handleHttpError(response: Response): Promise<OmoideError> {
    let errorData: any = {}
    
    try {
      errorData = await response.json()
    } catch {
      // If response is not JSON, use status text
      errorData = { message: response.statusText }
    }

    const message = errorData.error || errorData.message || `HTTP ${response.status}`
    
    switch (response.status) {
      case 400:
        return createError(ErrorType.VALIDATION_ERROR, message, errorData)
      case 401:
        return createError(ErrorType.AUTHENTICATION_ERROR, message, errorData)
      case 403:
        return createError(ErrorType.PERMISSION_DENIED, message, errorData)
      case 429:
        return createError(ErrorType.RATE_LIMIT_EXCEEDED, message, errorData)
      case 500:
      case 502:
      case 503:
      case 504:
        return createError(ErrorType.UNKNOWN_ERROR, message, errorData)
      default:
        return createError(ErrorType.UNKNOWN_ERROR, message, errorData)
    }
  }

  async get<T>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' }, retryOptions)
  }

  async post<T>(
    url: string, 
    data?: any, 
    options?: RequestInit, 
    retryOptions?: RetryOptions
  ): Promise<T> {
    return this.makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }, retryOptions)
  }

  async put<T>(
    url: string, 
    data?: any, 
    options?: RequestInit, 
    retryOptions?: RetryOptions
  ): Promise<T> {
    return this.makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, retryOptions)
  }

  async patch<T>(
    url: string, 
    data?: any, 
    options?: RequestInit, 
    retryOptions?: RetryOptions
  ): Promise<T> {
    return this.makeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }, retryOptions)
  }

  async delete<T>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' }, retryOptions)
  }

  // Specialized methods for file uploads
  async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void,
    retryOptions?: RetryOptions
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
      })
    }

    const operation = async (): Promise<T> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (error) {
              reject(createError(ErrorType.UNKNOWN_ERROR, error))
            }
          } else {
            reject(createError(ErrorType.UPLOAD_FAILED, `Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(createError(ErrorType.NETWORK_ERROR, 'Upload failed due to network error'))
        })

        xhr.addEventListener('timeout', () => {
          reject(createError(ErrorType.TIMEOUT_ERROR, 'Upload timed out'))
        })

        xhr.timeout = this.timeout
        xhr.open('POST', url.startsWith('http') ? url : `${this.baseUrl}${url}`)
        
        // Add default headers except Content-Type (let browser set it for FormData)
        Object.entries(this.defaultHeaders).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, value)
          }
        })

        xhr.send(formData)
      })
    }

    return withRetry(operation, retryOptions || this.retryOptions)
  }

  // Method for handling streaming responses
  async stream<T>(
    url: string,
    options: RequestInit = {},
    onChunk?: (chunk: T) => void,
    retryOptions?: RetryOptions
  ): Promise<void> {
    const operation = async (): Promise<void> => {
      const response = await fetch(url.startsWith('http') ? url : `${this.baseUrl}${url}`, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        }
      })

      if (!response.ok) {
        throw await this.handleHttpError(response)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw createError(ErrorType.UNKNOWN_ERROR, 'Response body is not readable')
      }

      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          
          if (onChunk) {
            try {
              const parsedChunk = JSON.parse(chunk)
              onChunk(parsedChunk)
            } catch {
              // If chunk is not JSON, pass as string
              onChunk(chunk as T)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }

    return withRetry(operation, retryOptions || this.retryOptions)
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  timeout: 30000,
  retryOptions: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true
  }
})

// Specialized API clients for different services
export const openaiClient = new ApiClient({
  timeout: 60000, // Longer timeout for AI operations
  retryOptions: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 30000
  }
})

export const visionClient = new ApiClient({
  timeout: 45000,
  retryOptions: {
    maxRetries: 3,
    baseDelay: 1500,
    maxDelay: 15000
  }
})

export default apiClient