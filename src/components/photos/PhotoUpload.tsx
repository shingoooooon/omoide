'use client'

import { useState, useCallback, useRef } from 'react'
import { Button, Card } from '@/components/ui'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { cn } from '@/lib/utils'
import { uploadPhotoSimple } from '@/lib/storage'
import { validatePhotoFiles, formatValidationErrors, ValidationOptions } from '@/lib/photoValidation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { ErrorType, createError, parseError } from '@/lib/errors'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useOperationFeedback } from '@/hooks/useOperationFeedback'

export interface Photo {
  id: string
  file: File
  url: string
  fileName: string
  uploadedAt: Date
  faceDetected?: boolean
  uploadProgress?: number
  storageUrl?: string
  storagePath?: string
  isUploaded?: boolean
}

interface PhotoUploadProps {
  onPhotosUploaded: (photos: Photo[]) => void
  maxPhotos?: number
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
  className?: string
  autoUpload?: boolean // Whether to automatically upload to Firebase Storage
  validationOptions?: ValidationOptions
}

export function PhotoUpload({
  onPhotosUploaded,
  maxPhotos = 10,
  maxFileSize = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className,
  autoUpload = true,
  validationOptions
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  
  const uploadOperation = useAsyncOperation({
    onSuccess: () => {
      showSuccess('アップロード完了', '写真のアップロードが完了しました')
    },
    onError: (error) => {
      showError('アップロードエラー', error.userMessage)
    }
  })

  const uploadFeedback = useOperationFeedback({
    showToasts: false, // We handle toasts manually
    steps: [
      { id: 'validate', label: '写真を検証中' },
      { id: 'upload', label: 'アップロード中' },
      { id: 'process', label: '処理完了' }
    ]
  })

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)

    // Check total photo limit
    if (photos.length + fileArray.length > maxPhotos) {
      setErrors([`写真は最大${maxPhotos}枚まで選択できます（現在: ${photos.length + fileArray.length}枚）`])
      return
    }

    // Enhanced validation
    const validationOpts: ValidationOptions = {
      maxFileSize,
      allowedFormats: acceptedFormats,
      maxTotalFiles: maxPhotos,
      ...validationOptions
    }

    try {
      const validationResult = await validatePhotoFiles(fileArray, validationOpts)

      if (!validationResult.isValid) {
        setErrors(formatValidationErrors(validationResult.errors))
        return
      }

      // Clear previous errors and set warnings if any
      setErrors([])
      setWarnings(validationResult.warnings || [])

      // Create photo objects with preview URLs
      const newPhotos: Photo[] = fileArray.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        file,
        url: URL.createObjectURL(file),
        fileName: file.name,
        uploadedAt: new Date(),
        uploadProgress: 0,
        isUploaded: false
      }))

      const updatedPhotos = [...photos, ...newPhotos]
      setPhotos(updatedPhotos)

      // Auto-upload to Firebase Storage if enabled and user is authenticated
      if (autoUpload && user) {
        uploadPhotosToStorage(newPhotos)
      } else {
        // Use setTimeout to avoid setState during render
        setTimeout(() => onPhotosUploaded(updatedPhotos), 0)
      }
    } catch (error) {
      const omoideError = parseError(error)
      console.error('Validation error:', omoideError)
      setErrors([omoideError.userMessage])
      showError('検証エラー', omoideError.userMessage)
    }
  }, [photos, maxPhotos, maxFileSize, acceptedFormats, validationOptions, autoUpload, user, onPhotosUploaded])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => {
      if (photo.id === photoId) {
        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(photo.url)
        return false
      }
      return true
    })
    setPhotos(updatedPhotos)
    // Use setTimeout to avoid setState during render
    setTimeout(() => onPhotosUploaded(updatedPhotos), 0)
  }

  const uploadPhotosToStorage = async (photosToUpload: Photo[]) => {
    if (!user) {
      const error = createError(ErrorType.AUTHENTICATION_ERROR, 'User not authenticated')
      setErrors([error.userMessage])
      showError('認証エラー', error.userMessage)
      return
    }

    console.log('🔐 User authentication status:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    })

    uploadFeedback.startOperation(`${photosToUpload.length}枚の写真をアップロードします`)
    uploadFeedback.setCurrentStep('validate', '写真を検証しています...')

    await uploadOperation.execute(async (signal, updateProgress) => {
      try {
        uploadFeedback.completeStep('validate')
        uploadFeedback.setCurrentStep('upload', 'Firebase Storageにアップロード中...')

        const uploadPromises = photosToUpload.map(async (photo, index) => {
          try {
            // Update progress to show upload starting
            setPhotos(prevPhotos =>
              prevPhotos.map(p =>
                p.id === photo.id
                  ? { ...p, uploadProgress: 10 }
                  : p
              )
            )

            // Use the working simple upload function
            const result = await uploadPhotoSimple(photo.file, user.uid)
            
            // Update photo with successful upload result
            setPhotos(prevPhotos => {
              const updatedPhotos = prevPhotos.map(p =>
                p.id === photo.id
                  ? {
                    ...p,
                    uploadProgress: 100,
                    storageUrl: result.url,
                    storagePath: result.path,
                    isUploaded: true
                  }
                  : p
              )
              // Use setTimeout to avoid setState during render
              setTimeout(() => onPhotosUploaded(updatedPhotos), 0)
              return updatedPhotos
            })

            // Update overall progress
            const overallProgress = ((index + 1) / photosToUpload.length) * 100
            updateProgress?.(overallProgress)
            uploadFeedback.updateProgress(overallProgress, `${index + 1}/${photosToUpload.length} 枚完了`)

          } catch (error) {
            const omoideError = parseError(error)
            console.error(`Upload error for ${photo.fileName}:`, omoideError)
            
            const errorMessage = `${photo.fileName}: ${omoideError.userMessage}`
            setErrors(prev => [...prev, errorMessage])
            showError('アップロードエラー', errorMessage)
            
            // Update photo to show error state
            setPhotos(prevPhotos =>
              prevPhotos.map(p =>
                p.id === photo.id
                  ? { ...p, uploadProgress: undefined, isUploaded: false }
                  : p
              )
            )
            
            throw omoideError
          }
        })

        await Promise.all(uploadPromises)
        
        uploadFeedback.completeStep('upload')
        uploadFeedback.setCurrentStep('process', '処理を完了しています...')
        uploadFeedback.completeStep('process')
        uploadFeedback.completeOperation('すべての写真のアップロードが完了しました')
        
        return photosToUpload
      } catch (error) {
        uploadFeedback.failOperation(error, 'アップロードに失敗しました')
        throw error
      }
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Loading Overlay for Upload Progress */}
      <LoadingOverlay
        isVisible={uploadFeedback.isLoading}
        title="写真をアップロード中"
        message={uploadFeedback.message}
        variant="steps"
        steps={uploadFeedback.steps}
        backdrop="blur"
        size="md"
      />

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50',
          isDragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300',
          'p-8 text-center'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200',
            isDragOver ? 'bg-primary-100' : 'bg-neutral-100'
          )}>
            <svg
              className={cn(
                'w-8 h-8 transition-colors duration-200',
                isDragOver ? 'text-primary-600' : 'text-neutral-400'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              写真をアップロード
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              ファイルをドラッグ&ドロップするか、クリックして選択してください
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                openFileDialog()
              }}
            >
              📁 ファイルを選択
            </Button>
          </div>

          <div className="text-xs text-neutral-500 space-y-1">
            <p>対応形式: JPEG, PNG, WebP</p>
            <p>最大ファイルサイズ: {maxFileSize}MB</p>
            <p>最大枚数: {maxPhotos}枚</p>
          </div>
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-error-200 bg-error-50">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-error-800 mb-1">
                アップロードエラー
              </h4>
              <ul className="text-sm text-error-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Warning Messages */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                注意事項
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-neutral-900 mb-4">
            選択された写真 ({photos.length}/{maxPhotos})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <PhotoPreview
                key={photo.id}
                photo={photo}
                onRemove={removePhoto}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface PhotoPreviewProps {
  photo: Photo
  onRemove: (photoId: string) => void
}

function PhotoPreview({ photo, onRemove }: PhotoPreviewProps) {
  const getStatusIcon = () => {
    if (photo.uploadProgress !== undefined && photo.uploadProgress < 100) {
      return null // Show loading spinner
    }
    if (photo.isUploaded) {
      return (
        <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }
    return (
      <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-soft">
        <img
          src={photo.url}
          alt={photo.fileName}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Upload Progress */}
      {photo.uploadProgress !== undefined && photo.uploadProgress < 100 && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-xs font-medium">{photo.uploadProgress}%</div>
          </div>
        </div>
      )}

      {/* Status Icon */}
      {getStatusIcon()}

      {/* Remove Button */}
      <button
        onClick={() => onRemove(photo.id)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-error-600 z-10"
        title="写真を削除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* File Info */}
      <div className="mt-2 space-y-1">
        <div className="text-xs text-neutral-600 truncate" title={photo.fileName}>
          {photo.fileName}
        </div>
        <div className="text-xs text-neutral-500">
          {photo.isUploaded ? (
            <span className="text-green-600 font-medium">✓ アップロード完了</span>
          ) : photo.uploadProgress !== undefined && photo.uploadProgress < 100 ? (
            <span className="text-blue-600">アップロード中...</span>
          ) : (
            <span className="text-amber-600">アップロード待機中</span>
          )}
        </div>
      </div>
    </div>
  )
}