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
      // Prepare analysis data for each photo
      const analysisDataArray = record.photos.map((photo, index) => ({
        photoId: photo.id,
        photoUrl: photo.url,
        fileName: photo.fileName,
        uploadedAt: photo.uploadedAt,
        faceDetected: photo.faceDetected,
        index
      }));

      // Call the comment generation API
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

      if (!data.success) {
        throw new Error(data.error || 'コメント生成に失敗しました');
      }

      // Add comments to the growth record
      await addCommentsToGrowthRecord(record.id, data.comments);

      setState({
        isGenerating: false,
        error: null,
        success: true
      });

      // Return updated record (you might want to refetch from the server)
      const updatedRecord: GrowthRecord = {
        ...record,
        comments: [
          ...record.comments,
          ...data.comments.map((content: string, index: number) => ({
            id: `${record.id}_comment_${Date.now()}_${index}`,
            photoId: record.photos[index]?.id || `photo_${index}`,
            content,
            generatedAt: new Date(),
            isEdited: false
          }))
        ],
        updatedAt: new Date()
      };

      return updatedRecord;

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