'use client';

import { useState } from 'react';
import { GrowthRecord } from '@/types/models';
import { addCommentsToGrowthRecord } from '@/lib/services/growthRecordService';

interface CommentGenerationState {
  isGenerating: boolean;
  error: string | null;
  success: boolean;
}

export function useCommentGeneration() {
  const [state, setState] = useState<CommentGenerationState>({
    isGenerating: false,
    error: null,
    success: false
  });

  const generateComments = async (record: GrowthRecord): Promise<GrowthRecord | null> => {
    setState({
      isGenerating: true,
      error: null,
      success: false
    });

    try {
      // For single photo records, generate comment for that specific photo
      if (record.photos.length === 1) {
        const photo = record.photos[0];
        
        // Call the comment generation API for single photo
        const response = await fetch('/api/generate-comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisDataArray: [{
              photoId: photo.id,
              photoUrl: photo.url,
              fileName: photo.fileName,
              uploadedAt: photo.uploadedAt,
              faceDetected: photo.faceDetected,
              index: 0
            }]
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'コメント生成に失敗しました');
        }

        // Create new comment for this photo
        const newComment = {
          id: `${record.id}_comment_${Date.now()}`,
          photoId: photo.id,
          content: data.comments[0],
          generatedAt: new Date(),
          isEdited: false
        };

        // Replace existing comments for this photo with the new one
        const { replaceCommentForPhoto } = await import('@/lib/services/growthRecordService');
        await replaceCommentForPhoto(record.id, photo.id, newComment);

        setState({
          isGenerating: false,
          error: null,
          success: true
        });

        // Return updated record with replaced comment
        const updatedRecord: GrowthRecord = {
          ...record,
          comments: [newComment],
          updatedAt: new Date()
        };

        return updatedRecord;
      } else {
        throw new Error('複数写真のレコードはサポートされていません');
      }

    } catch (error) {
      console.error('Error generating comments:', error);
      setState({
        isGenerating: false,
        error: error instanceof Error ? error.message : 'コメント生成中にエラーが発生しました',
        success: false
      });
      return null;
    }
  };

  const reset = () => {
    setState({
      isGenerating: false,
      error: null,
      success: false
    });
  };

  return {
    ...state,
    generateComments,
    reset
  };
}