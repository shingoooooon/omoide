export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ValidationOptions {
  maxFileSize?: number // in MB
  minFileSize?: number // in MB
  maxWidth?: number // in pixels
  maxHeight?: number // in pixels
  minWidth?: number // in pixels
  minHeight?: number // in pixels
  allowedFormats?: string[]
  maxTotalFiles?: number
  requireFaceDetection?: boolean
}

const DEFAULT_OPTIONS: Required<Omit<ValidationOptions, 'requireFaceDetection'>> = {
  maxFileSize: 10, // 10MB
  minFileSize: 0.01, // 10KB
  maxWidth: 4096,
  maxHeight: 4096,
  minWidth: 100,
  minHeight: 100,
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxTotalFiles: 10
}

/**
 * Validate a single photo file
 */
export async function validatePhotoFile(
  file: File,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  const warnings: string[] = []

  // Basic file validation
  if (!file) {
    errors.push('ファイルが選択されていません')
    return { isValid: false, errors, warnings }
  }

  // File type validation
  if (!opts.allowedFormats.includes(file.type)) {
    const supportedFormats = opts.allowedFormats
      .map(format => format.split('/')[1].toUpperCase())
      .join(', ')
    errors.push(`サポートされていないファイル形式です。対応形式: ${supportedFormats}`)
  }

  // File size validation
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > opts.maxFileSize) {
    errors.push(`ファイルサイズが大きすぎます（${fileSizeMB.toFixed(2)}MB）。${opts.maxFileSize}MB以下のファイルをお選びください`)
  }
  
  if (fileSizeMB < opts.minFileSize) {
    errors.push(`ファイルサイズが小さすぎます（${fileSizeMB.toFixed(2)}MB）。${opts.minFileSize}MB以上のファイルをお選びください`)
  }

  // Image dimension validation (requires loading the image)
  try {
    const dimensions = await getImageDimensions(file)
    
    if (dimensions.width > opts.maxWidth || dimensions.height > opts.maxHeight) {
      errors.push(`画像サイズが大きすぎます（${dimensions.width}x${dimensions.height}）。最大${opts.maxWidth}x${opts.maxHeight}ピクセルまでです`)
    }
    
    if (dimensions.width < opts.minWidth || dimensions.height < opts.minHeight) {
      errors.push(`画像サイズが小さすぎます（${dimensions.width}x${dimensions.height}）。最小${opts.minWidth}x${opts.minHeight}ピクセル以上が必要です`)
    }

    // Add warnings for very large images
    if (dimensions.width > 2048 || dimensions.height > 2048) {
      warnings.push('大きな画像です。アップロードに時間がかかる場合があります')
    }
  } catch (error) {
    errors.push('画像ファイルの読み込みに失敗しました。ファイルが破損している可能性があります')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate multiple photo files
 */
export async function validatePhotoFiles(
  files: File[],
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const allErrors: string[] = []
  const allWarnings: string[] = []

  // Check total file count
  if (files.length > opts.maxTotalFiles) {
    allErrors.push(`写真は最大${opts.maxTotalFiles}枚まで選択できます（現在: ${files.length}枚）`)
  }

  // Check for duplicate files
  const fileNames = files.map(f => f.name)
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index)
  if (duplicates.length > 0) {
    allWarnings.push(`重複するファイル名があります: ${[...new Set(duplicates)].join(', ')}`)
  }

  // Validate each file
  const validationPromises = files.map(async (file, index) => {
    const result = await validatePhotoFile(file, options)
    return {
      index,
      fileName: file.name,
      ...result
    }
  })

  const results = await Promise.all(validationPromises)

  // Collect all errors and warnings
  results.forEach(result => {
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        allErrors.push(`${result.fileName}: ${error}`)
      })
    }
    if (result.warnings) {
      result.warnings.forEach(warning => {
        allWarnings.push(`${result.fileName}: ${warning}`)
      })
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  }
}

/**
 * Get image dimensions from a file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました'))
    }
    
    img.src = url
  })
}

/**
 * Check if file is a valid image by trying to load it
 */
export function isValidImageFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(true)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }
    
    img.src = url
  })
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  // Remove or replace unsafe characters
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase()
}

/**
 * Generate user-friendly error messages
 */
export function formatValidationErrors(errors: string[]): string[] {
  return errors.map(error => {
    // Make error messages more user-friendly
    if (error.includes('サポートされていないファイル形式')) {
      return `${error} 📷 写真ファイル（JPEG、PNG、WebP）をお選びください`
    }
    if (error.includes('ファイルサイズが大きすぎます')) {
      return `${error} 💾 ファイルサイズを小さくしてから再度お試しください`
    }
    if (error.includes('画像サイズが大きすぎます')) {
      return `${error} 📐 画像を小さくリサイズしてから再度お試しください`
    }
    if (error.includes('画像ファイルの読み込みに失敗')) {
      return `${error} ❌ 別の写真をお試しください`
    }
    return error
  })
}