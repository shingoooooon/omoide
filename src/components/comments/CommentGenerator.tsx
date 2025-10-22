'use client';

import React, { useState } from 'react';
import { 
  generateCommentsForPhotos, 
  GrowthComment, 
  Photo 
} from '@/lib/commentGenerationService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { parseError } from '@/lib/errors';

interface CommentGeneratorProps {
  photos: Photo[];
  analysisDataArray: any[];
  onCommentsGenerated: (comments: GrowthComment[]) => void;
  disabled?: boolean;
}

export function CommentGenerator({ 
  photos, 
  analysisDataArray, 
  onCommentsGenerated,
  disabled = false
}: CommentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateComments = async () => {
    if (photos.length === 0 || analysisDataArray.length === 0) {
      setError('写真と解析データが必要です');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateCommentsForPhotos(photos, analysisDataArray);
      
      if (result.success) {
        onCommentsGenerated(result.comments);
      } else {
        setError(result.error || 'コメント生成に失敗しました');
      }
    } catch (error) {
      console.error('コメント生成エラー:', error);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 生成ボタン */}
      <div className="text-center">
        <Button
          onClick={handleGenerateComments}
          disabled={disabled || isGenerating || photos.length === 0}
          className="px-6 py-3"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>AIコメントを生成中...</span>
            </div>
          ) : (
            'AIコメントを生成する'
          )}
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-red-800 font-medium">エラーが発生しました</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 生成中の説明 */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <div>
              <h4 className="text-blue-800 font-medium">AIがコメントを生成しています</h4>
              <p className="text-blue-700 text-sm mt-1">
                写真を解析して、心温まる成長コメントを作成中です...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 使用方法の説明 */}
      {!isGenerating && photos.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-800 font-medium mb-2">AIコメント生成について</h4>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• アップロードされた写真を解析して、成長コメントを自動生成します</li>
            <li>• 生成されたコメントは後から編集できます</li>
            <li>• {photos.length}枚の写真に対してコメントを生成します</li>
          </ul>
        </div>
      )}
    </div>
  );
}