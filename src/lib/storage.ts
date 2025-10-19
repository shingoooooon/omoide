import { storage } from './firebase'
import { ref, uploadBytesResumable, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  percentage: number
}

export interface UploadResult {
  url: string
  path: string
  fileName: string
  size: number
  contentType: string
  uploadedAt: Date
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  onError?: (error: Error) => void
  onComplete?: (result: UploadResult) => void
}

/**
 * Upload a photo file to Firebase Storage
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @param options - Upload options for callbacks
 * @returns Promise<UploadResult>
 */
export async function uploadPhoto(
  file: File,
  userId: string,
  options?: UploadOptions
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    try {
      // Debug: Log upload attempt
      console.log('🔄 Starting photo upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userId
      })

      // Generate unique filename to avoid conflicts
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const filePath = `photos/${userId}/${uniqueFileName}`
      
      console.log('📁 Upload path:', filePath)
      
      // Create storage reference
      const storageRef = ref(storage, filePath)
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          userId: userId
        }
      })
      
      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          }
          
          options?.onProgress?.(progress)
        },
        (error) => {
          console.error('❌ Upload error details:', {
            code: error.code,
            message: error.message,
            serverResponse: error.serverResponse,
            customData: error.customData
          })
          
          let userFriendlyMessage = 'アップロードに失敗しました'
          
          // Provide specific error messages based on error code
          switch (error.code) {
            case 'storage/unauthorized':
              userFriendlyMessage = 'アップロード権限がありません。ログインしてください。'
              break
            case 'storage/canceled':
              userFriendlyMessage = 'アップロードがキャンセルされました。'
              break
            case 'storage/unknown':
              userFriendlyMessage = 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
              break
            case 'storage/object-not-found':
              userFriendlyMessage = 'ファイルが見つかりません。'
              break
            case 'storage/bucket-not-found':
              userFriendlyMessage = 'ストレージの設定に問題があります。'
              break
            case 'storage/project-not-found':
              userFriendlyMessage = 'プロジェクトの設定に問題があります。'
              break
            case 'storage/quota-exceeded':
              userFriendlyMessage = 'ストレージの容量制限に達しました。'
              break
            case 'storage/unauthenticated':
              userFriendlyMessage = '認証が必要です。ログインしてください。'
              break
            case 'storage/retry-limit-exceeded':
              userFriendlyMessage = 'アップロードの再試行回数が上限に達しました。'
              break
            default:
              userFriendlyMessage = `アップロードに失敗しました: ${error.message}`
          }
          
          const uploadError = new Error(userFriendlyMessage)
          options?.onError?.(uploadError)
          reject(uploadError)
        },
        async () => {
          try {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            const metadata = await getMetadata(uploadTask.snapshot.ref)
            
            const result: UploadResult = {
              url: downloadURL,
              path: filePath,
              fileName: uniqueFileName,
              size: metadata.size,
              contentType: metadata.contentType || file.type,
              uploadedAt: new Date()
            }
            
            options?.onComplete?.(result)
            resolve(result)
          } catch (error) {
            console.error('Error getting download URL:', error)
            const urlError = new Error('アップロード完了後のURL取得に失敗しました')
            options?.onError?.(urlError)
            reject(urlError)
          }
        }
      )
    } catch (error) {
      console.error('Upload initialization error:', error)
      const initError = new Error('アップロードの初期化に失敗しました')
      options?.onError?.(initError)
      reject(initError)
    }
  })
}

/**
 * Upload multiple photos concurrently
 * @param files - Array of files to upload
 * @param userId - The user ID for organizing files
 * @param options - Upload options for callbacks
 * @returns Promise<UploadResult[]>
 */
export async function uploadMultiplePhotos(
  files: File[],
  userId: string,
  options?: {
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
    onFileComplete?: (fileIndex: number, result: UploadResult) => void
    onError?: (fileIndex: number, error: Error) => void
    onAllComplete?: (results: UploadResult[]) => void
  }
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) => 
    uploadPhoto(file, userId, {
      onProgress: (progress) => options?.onProgress?.(index, progress),
      onComplete: (result) => options?.onFileComplete?.(index, result),
      onError: (error) => options?.onError?.(index, error)
    })
  )
  
  try {
    const results = await Promise.all(uploadPromises)
    options?.onAllComplete?.(results)
    return results
  } catch (error) {
    console.error('Multiple upload error:', error)
    throw new Error('一部またはすべてのファイルのアップロードに失敗しました')
  }
}

/**
 * Delete a photo from Firebase Storage
 * @param filePath - The storage path of the file to delete
 */
export async function deletePhoto(filePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error('ファイルの削除に失敗しました')
  }
}

/**
 * Get photo metadata
 * @param filePath - The storage path of the file
 */
export async function getPhotoMetadata(filePath: string) {
  try {
    const storageRef = ref(storage, filePath)
    return await getMetadata(storageRef)
  } catch (error) {
    console.error('Metadata error:', error)
    throw new Error('ファイル情報の取得に失敗しました')
  }
}

/**
 * Simple upload function using uploadBytes (no progress tracking)
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @returns Promise<UploadResult>
 */
export async function uploadPhotoSimple(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    console.log('🔄 Starting simple photo upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: userId
    })

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `photos/${userId}/${uniqueFileName}`
    
    console.log('📁 Upload path:', filePath)
    
    // Create storage reference
    const storageRef = ref(storage, filePath)
    
    // Upload file using simple uploadBytes
    console.log('⬆️ Uploading with uploadBytes...')
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        userId: userId
      }
    })
    
    console.log('✅ Upload successful:', uploadResult)
    
    // Get download URL
    console.log('🔗 Getting download URL...')
    const downloadURL = await getDownloadURL(uploadResult.ref)
    
    console.log('✅ Download URL obtained:', downloadURL)
    
    const result: UploadResult = {
      url: downloadURL,
      path: filePath,
      fileName: uniqueFileName,
      size: uploadResult.metadata.size,
      contentType: uploadResult.metadata.contentType || file.type,
      uploadedAt: new Date()
    }
    
    return result
  } catch (error) {
    console.error('❌ Simple upload error:', error)
    throw error
  }
}

/**
 * Generate a unique file path for a user's photo
 * @param userId - The user ID
 * @param originalFileName - The original file name
 * @returns string - The unique file path
 */
export function generatePhotoPath(userId: string, originalFileName: string): string {
  const fileExtension = originalFileName.split('.').pop()
  const uniqueFileName = `${uuidv4()}.${fileExtension}`
  return `photos/${userId}/${uniqueFileName}`
}

/**
 * Upload an image from URL to Firebase Storage
 * @param imageUrl - The URL of the image to upload
 * @param fileName - The desired file name/path in storage
 * @returns Promise<string> - The download URL of the uploaded image
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  fileName: string
): Promise<string> {
  try {
    console.log('🔄 Starting image upload from URL:', { imageUrl, fileName });

    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the image data as a blob
    const imageBlob = await response.blob();
    console.log('📦 Image blob created:', { size: imageBlob.size, type: imageBlob.type });
    
    // Create storage reference - use generated folder for better permissions
    const generatedFileName = `generated/${fileName}`;
    const storageRef = ref(storage, generatedFileName);
    
    console.log('📁 Storage reference created:', generatedFileName);
    
    // Upload the blob to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, imageBlob, {
      contentType: imageBlob.type || 'image/png',
      customMetadata: {
        source: 'generated-illustration',
        uploadedAt: new Date().toISOString(),
        originalUrl: imageUrl,
      }
    });
    
    console.log('⬆️ Upload completed:', uploadResult.metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    console.log('✅ Image uploaded successfully:', downloadURL);
    return downloadURL;

  } catch (error: any) {
    console.error('❌ Image upload from URL error:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Firebase Storage権限エラー: アップロード権限がありません');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Firebase Storage容量エラー: ストレージ容量が不足しています');
    } else if (error.code === 'storage/unauthenticated') {
      throw new Error('Firebase Storage認証エラー: 認証が必要です');
    } else {
      throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
    }
  }
}

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @param allowedTypes - Array of allowed MIME types
 */
export function validatePhotoFile(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
): { isValid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `サポートされていないファイル形式です。対応形式: ${allowedTypes.join(', ')}`
    }
  }
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `ファイルサイズが大きすぎます。${maxSizeMB}MB以下のファイルをお選びください。`
    }
  }
  
  return { isValid: true }
}