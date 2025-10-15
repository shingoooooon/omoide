'use client';

import { useState, useCallback } from 'react';
import { GrowthComment, Photo, generateCommentsForPhotos } from '@/lib/commentGenerationService';

interface UseCommentsReturn {
  comments: GrowthComment[];
  isGenerating: boolean;
  error: string | null;
  generateComments: (photos: Photo[], analysisDataArray: any[]) => Promise<void>;
  updateComments: (comments: GrowthComment[]) => void;
  clearComments: () => void;
  clearError: () => void;
}

export function useComments(): UseCommentsReturn {
  const [comments, setComments] = useState<GrowthComment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateComments = useCallback(async (photos: Photo[], analysisDataArray: any[]) => {
    if (photos.length === 0 || analysisDataArray.length === 0) {
      setError('写真と解析データが必要です');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateCommentsForPhotos(photos, analysisDataArray);
      
      if (result.success) {
        setComments(result.comments);
      } else {
        setError(result.error || 'コメント生成に失敗しました');
      }
    } catch (error) {
      console.error('コメント生成エラー:', error);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateComments = useCallback((newComments: GrowthComment[]) => {
    setComments(newComments);
  }, []);

  const clearComments = useCallback(() => {
    setComments([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    comments,
    isGenerating,
    error,
    generateComments,
    updateComments,
    clearComments,
    clearError
  };
}