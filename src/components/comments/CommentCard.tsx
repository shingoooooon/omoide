'use client';

import React, { useState } from 'react';
import { GrowthComment } from '@/lib/commentGenerationService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CommentCardProps {
  comment: GrowthComment;
  photoUrl?: string;
  onCommentUpdate: (commentId: string, newContent: string) => void;
  onCommentDelete?: (commentId: string) => void;
  isEditable?: boolean;
}

export function CommentCard({ 
  comment, 
  photoUrl, 
  onCommentUpdate, 
  onCommentDelete,
  isEditable = true 
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = () => {
    if (editContent.trim() !== comment.content) {
      onCommentUpdate(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onCommentDelete && window.confirm('このコメントを削除しますか？')) {
      onCommentDelete(comment.id);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* 写真表示 */}
      {photoUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={photoUrl}
            alt="成長記録の写真"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* コメント表示・編集 */}
      <div className="space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              maxLength={200}
              placeholder="コメントを入力してください..."
            />
            <div className="text-sm text-gray-500 text-right">
              {editContent.length}/200文字
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!editContent.trim()}
              >
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-800 leading-relaxed">
              {comment.content}
            </p>
            {isEditable && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  編集
                </Button>
                {onCommentDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    削除
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* メタデータ */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>
          {comment.generatedAt.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {comment.isEdited && (
          <span className="text-blue-600">編集済み</span>
        )}
      </div>
    </Card>
  );
}