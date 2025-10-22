/**
 * Error handling utilities and types for the Omoide application
 * Implements comprehensive error handling as per requirements 2.4 and 8.4
 */

export enum ErrorType {
  // Upload and file errors
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  
  // Face detection and analysis errors
  FACE_NOT_DETECTED = 'FACE_NOT_DETECTED',
  VISION_API_ERROR = 'VISION_API_ERROR',
  
  // AI service errors
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  COMMENT_GENERATION_FAILED = 'COMMENT_GENERATION_FAILED',
  STORYBOOK_GENERATION_FAILED = 'STORYBOOK_GENERATION_FAILED',
  ILLUSTRATION_GENERATION_FAILED = 'ILLUSTRATION_GENERATION_FAILED',
  
  // Audio and TTS errors
  TTS_GENERATION_FAILED = 'TTS_GENERATION_FAILED',
  AUDIO_PLAYBACK_ERROR = 'AUDIO_PLAYBACK_ERROR',
  
  // Network and connectivity errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Authentication and authorization errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Database and storage errors
  FIRESTORE_ERROR = 'FIRESTORE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // Quota and rate limiting errors
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // General application errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string // User-friendly message in Japanese
  details?: any
  timestamp: Date
  retryable: boolean
  retryCount?: number
  maxRetries?: number
}

export class OmoideError extends Error {
  public readonly type: ErrorType
  public readonly userMessage: string
  public readonly details?: any
  public readonly timestamp: Date
  public readonly retryable: boolean
  public retryCount: number
  public readonly maxRetries: number

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    options: {
      details?: any
      retryable?: boolean
      maxRetries?: number
      cause?: Error
    } = {}
  ) {
    super(message, { cause: options.cause })
    this.name = 'OmoideError'
    this.type = type
    this.userMessage = userMessage
    this.details = options.details
    this.timestamp = new Date()
    this.retryable = options.retryable ?? false
    this.retryCount = 0
    this.maxRetries = options.maxRetries ?? 3
  }

  toJSON(): AppError {
    return {
      type: this.type,
      message: this.message,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries
    }
  }
}

/**
 * User-friendly error messages in Japanese
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.UPLOAD_FAILED]: '写真のアップロードに失敗しました。もう一度お試しください。',
  [ErrorType.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます。10MB以下の画像を選択してください。',
  [ErrorType.INVALID_FILE_TYPE]: '対応していないファイル形式です。JPEG、PNG、WebP形式の画像を選択してください。',
  
  [ErrorType.FACE_NOT_DETECTED]: 'お子さまの顔が検出できませんでした。顔がはっきり写っている写真をお試しください。',
  [ErrorType.VISION_API_ERROR]: '画像の解析中にエラーが発生しました。しばらく待ってからお試しください。',
  
  [ErrorType.OPENAI_API_ERROR]: 'AIサービスに接続できませんでした。しばらく待ってからお試しください。',
  [ErrorType.COMMENT_GENERATION_FAILED]: 'コメントの生成に失敗しました。もう一度お試しください。',
  [ErrorType.STORYBOOK_GENERATION_FAILED]: '絵本の生成に失敗しました。もう一度お試しください。',
  [ErrorType.ILLUSTRATION_GENERATION_FAILED]: '挿絵の生成に失敗しました。もう一度お試しください。',
  
  [ErrorType.TTS_GENERATION_FAILED]: '音声の生成に失敗しました。もう一度お試しください。',
  [ErrorType.AUDIO_PLAYBACK_ERROR]: '音声の再生中にエラーが発生しました。',
  
  [ErrorType.NETWORK_ERROR]: 'インターネット接続を確認してください。',
  [ErrorType.TIMEOUT_ERROR]: '処理に時間がかかりすぎています。もう一度お試しください。',
  
  [ErrorType.AUTHENTICATION_ERROR]: 'ログインが必要です。',
  [ErrorType.PERMISSION_DENIED]: 'この操作を行う権限がありません。',
  
  [ErrorType.FIRESTORE_ERROR]: 'データの保存中にエラーが発生しました。',
  [ErrorType.STORAGE_ERROR]: 'ファイルの保存中にエラーが発生しました。',
  
  [ErrorType.QUOTA_EXCEEDED]: '利用制限に達しました。しばらく待ってからお試しください。',
  [ErrorType.RATE_LIMIT_EXCEEDED]: 'リクエストが多すぎます。少し待ってからお試しください。',
  
  [ErrorType.VALIDATION_ERROR]: '入力内容に問題があります。',
  [ErrorType.UNKNOWN_ERROR]: '予期しないエラーが発生しました。'
}

/**
 * Create an OmoideError from various error sources
 */
export function createError(
  type: ErrorType,
  originalError?: Error | unknown,
  details?: any
): OmoideError {
  const message = originalError instanceof Error ? originalError.message : String(originalError)
  const userMessage = ERROR_MESSAGES[type]
  
  const retryableTypes = [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.OPENAI_API_ERROR,
    ErrorType.VISION_API_ERROR,
    ErrorType.TTS_GENERATION_FAILED,
    ErrorType.UPLOAD_FAILED,
    ErrorType.FIRESTORE_ERROR,
    ErrorType.STORAGE_ERROR
  ]

  return new OmoideError(type, message, userMessage, {
    details,
    retryable: retryableTypes.includes(type),
    maxRetries: type === ErrorType.NETWORK_ERROR ? 5 : 3,
    cause: originalError instanceof Error ? originalError : undefined
  })
}

/**
 * Parse and categorize errors from different sources
 */
export function parseError(error: unknown): OmoideError {
  if (error instanceof OmoideError) {
    return error
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createError(ErrorType.NETWORK_ERROR, error)
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return createError(ErrorType.TIMEOUT_ERROR, error)
    }

    // Firebase errors
    if (error.message.includes('permission-denied')) {
      return createError(ErrorType.PERMISSION_DENIED, error)
    }

    if (error.message.includes('unauthenticated')) {
      return createError(ErrorType.AUTHENTICATION_ERROR, error)
    }

    // OpenAI API errors
    if (error.message.includes('openai') || error.message.includes('gpt')) {
      return createError(ErrorType.OPENAI_API_ERROR, error)
    }

    // Vision API errors
    if (error.message.includes('vision') || error.message.includes('google')) {
      return createError(ErrorType.VISION_API_ERROR, error)
    }
  }

  // Default to unknown error
  return createError(ErrorType.UNKNOWN_ERROR, error)
}

/**
 * Check if an error should be retried
 */
export function shouldRetry(error: OmoideError): boolean {
  return error.retryable && error.retryCount < error.maxRetries
}

/**
 * Increment retry count for an error
 */
export function incrementRetryCount(error: OmoideError): OmoideError {
  error.retryCount += 1
  return error
}

/**
 * Get retry delay in milliseconds with exponential backoff
 */
export function getRetryDelay(retryCount: number): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)
  
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000
}

/**
 * Log error for debugging and monitoring
 */
export function logError(error: OmoideError, context?: string): void {
  console.error(`[${context || 'OmoideError'}]`, {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    details: error.details,
    timestamp: error.timestamp,
    retryCount: error.retryCount,
    stack: error.stack
  })
}