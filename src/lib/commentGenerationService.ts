// コメント生成サービス
import { canMakeRequest, recordRequest } from './usageTracker';

export interface GrowthComment {
  id: string;
  photoId: string;
  content: string;
  generatedAt: Date;
  isEdited: boolean;
}

export interface Photo {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: Date;
  faceDetected: boolean;
}

export interface CommentGenerationResult {
  success: boolean;
  comments: GrowthComment[];
  error?: string;
}

// コメント生成API呼び出し
export async function generateCommentsForPhotos(
  photos: Photo[],
  analysisDataArray: any[]
): Promise<CommentGenerationResult> {
  // 使用量制限チェック
  const usageCheck = canMakeRequest();
  if (!usageCheck.allowed) {
    return {
      success: false,
      comments: [],
      error: usageCheck.reason
    };
  }

  try {
    const response = await fetch('/api/generate-comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysisDataArray
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        comments: [],
        error: data.error || 'コメント生成に失敗しました'
      };
    }

    if (!data.success) {
      return {
        success: false,
        comments: [],
        error: data.error || 'コメント生成に失敗しました'
      };
    }

    // 使用量を記録
    recordRequest();

    // レスポンスをGrowthCommentオブジェクトに変換
    const comments: GrowthComment[] = data.comments.map((content: string, index: number) => ({
      id: `comment-${Date.now()}-${index}`,
      photoId: photos[index]?.id || `photo-${index}`,
      content,
      generatedAt: new Date(),
      isEdited: false
    }));

    return {
      success: true,
      comments
    };

  } catch (error) {
    console.error('コメント生成サービス エラー:', error);
    return {
      success: false,
      comments: [],
      error: 'ネットワークエラーが発生しました'
    };
  }
}

// 単一コメントの更新
export function updateComment(
  comments: GrowthComment[],
  commentId: string,
  newContent: string
): GrowthComment[] {
  return comments.map(comment => 
    comment.id === commentId 
      ? { ...comment, content: newContent, isEdited: true }
      : comment
  );
}

// コメントの削除
export function removeComment(
  comments: GrowthComment[],
  commentId: string
): GrowthComment[] {
  return comments.filter(comment => comment.id !== commentId);
}