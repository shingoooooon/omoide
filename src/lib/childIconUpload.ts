import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface ChildIconUploadResult {
  url: string;
  fileName: string;
}

/**
 * Upload child icon image to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The authenticated user's ID
 * @returns Promise<ChildIconUploadResult>
 */
export async function uploadChildIcon(
  file: File,
  userId: string
): Promise<ChildIconUploadResult> {
  try {
    console.log('🔄 Starting child icon upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: userId
    });

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('画像ファイルを選択してください');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('ファイルサイズは5MB以下にしてください');
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `child-icon-${uuidv4()}.${fileExtension}`;
    const filePath = `child-icons/${userId}/${uniqueFileName}`;
    
    console.log('📁 Upload path:', filePath);
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Upload file
    console.log('⬆️ Uploading file...');
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        userId: userId,
        purpose: 'child-icon'
      }
    });
    
    console.log('✅ Upload successful');
    
    // Get download URL
    console.log('🔗 Getting download URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    console.log('✅ Download URL obtained:', downloadURL);
    
    return {
      url: downloadURL,
      fileName: uniqueFileName
    };
    
  } catch (error: any) {
    console.error('❌ Child icon upload error:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('アップロード権限がありません。ログインし直してください。');
    } else if (error.code === 'storage/unauthenticated') {
      throw new Error('認証が必要です。ログインしてください。');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('ストレージ容量が不足しています。');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('画像のアップロードに失敗しました。');
    }
  }
}