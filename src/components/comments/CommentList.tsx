'use client';

import React from 'react';
import { GrowthComment, Photo, updateComment, removeComment } from '@/lib/commentGenerationService';
import { CommentCard } from './CommentCard';

interface CommentListProps {
  comments: GrowthComment[];
  photos: Photo[];
  onCommentsUpdate: (comments: GrowthComment[]) => void;
  isEditable?: boolean;
}

export function CommentList({ 
  comments, 
  photos, 
  onCommentsUpdate,
  isEditable = true 
}: CommentListProps) {
  const handleCommentUpdate = (commentId: string, newContent: string) => {
    const updatedComments = updateComment(comments, commentId, newContent);
    onCommentsUpdate(updatedComments);
  };

  const handleCommentDelete = (commentId: string) => {
    const updatedComments = removeComment(comments, commentId);
    onCommentsUpdate(updatedComments);
  };

  // 写真とコメントをマッピング
  const getPhotoForComment = (comment: GrowthComment): Photo | undefined => {
    return photos.find(photo => photo.id === comment.photoId);
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-500">まだコメントがありません</p>
        <p className="text-gray-400 text-sm mt-1">
          写真をアップロードしてAIコメントを生成してみましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          成長コメント ({comments.length}件)
        </h3>
        {isEditable && (
          <p className="text-sm text-gray-500">
            コメントをクリックして編集できます
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {comments.map((comment) => {
          const photo = getPhotoForComment(comment);
          return (
            <CommentCard
              key={comment.id}
              comment={comment}
              photoUrl={photo?.url}
              onCommentUpdate={handleCommentUpdate}
              onCommentDelete={isEditable ? handleCommentDelete : undefined}
              isEditable={isEditable}
            />
          );
        })}
      </div>

      {/* 統計情報 */}
      {comments.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">コメント統計</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">総コメント数:</span>
              <span className="ml-2 font-medium">{comments.length}件</span>
            </div>
            <div>
              <span className="text-gray-500">編集済み:</span>
              <span className="ml-2 font-medium">
                {comments.filter(c => c.isEdited).length}件
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}