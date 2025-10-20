'use client';

import { useState, useEffect } from 'react';
import { GrowthRecord } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCommentGeneration } from '@/hooks/useCommentGeneration';
import { deleteGrowthRecord, removePhotoFromGrowthRecord } from '@/lib/services/growthRecordService';
import Image from 'next/image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecordDetailProps {
  record: GrowthRecord;
  isOpen: boolean;
  onClose: () => void;
  onRecordUpdate?: (updatedRecord: GrowthRecord) => void;
  onRecordDelete?: (recordId: string) => void;
}

export function RecordDetail({ record, isOpen, onClose, onRecordUpdate, onRecordDelete }: RecordDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(record);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  
  const { isGenerating, error, success, generateComments, reset } = useCommentGeneration();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  const handleGenerateComments = async () => {
    // If comments already exist, show confirmation dialog
    if (currentRecord.comments.length > 0) {
      setShowRegenerateConfirm(true);
      return;
    }
    
    // Generate comments directly if no existing comments
    await executeCommentGeneration();
  };

  const executeCommentGeneration = async () => {
    reset(); // Reset any previous state
    setShowRegenerateConfirm(false);
    
    // Extract original record ID from expanded record ID
    const originalRecordId = currentRecord.id.includes('_photo_') 
      ? currentRecord.id.split('_photo_')[0] 
      : currentRecord.id;
    
    // Create a record with the original ID for comment generation
    const recordForGeneration = {
      ...currentRecord,
      id: originalRecordId
    };
    
    const updatedRecord = await generateComments(recordForGeneration);
    
    if (updatedRecord) {
      // Restore the expanded record ID for display
      const displayRecord = {
        ...updatedRecord,
        id: currentRecord.id
      };
      setCurrentRecord(displayRecord);
      onRecordUpdate?.(displayRecord);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Extract original record ID for database operation
      const originalRecordId = currentRecord.id.includes('_photo_') 
        ? currentRecord.id.split('_photo_')[0] 
        : currentRecord.id;
        
      await deleteGrowthRecord(originalRecordId);
      onRecordDelete?.(currentRecord.id);
      onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
      // You might want to show an error message here
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveComment = async () => {
    if (!editingCommentId || !editingCommentText.trim()) return;

    setIsSavingComment(true);
    try {
      // Update comment in the record
      const updatedComments = currentRecord.comments.map(comment => 
        comment.id === editingCommentId 
          ? { 
              ...comment, 
              content: editingCommentText.trim(),
              isEdited: true,
              generatedAt: new Date() // Update timestamp for edited comment
            }
          : comment
      );

      const updatedRecord = {
        ...currentRecord,
        comments: updatedComments,
        updatedAt: new Date()
      };

      // Extract original record ID for database update
      const originalRecordId = currentRecord.id.includes('_photo_') 
        ? currentRecord.id.split('_photo_')[0] 
        : currentRecord.id;

      // Update the record using the service
      const { updateGrowthRecord } = await import('@/lib/services/growthRecordService');
      await updateGrowthRecord(originalRecordId, {
        comments: updatedComments.map(comment => ({
          id: comment.id,
          photoId: comment.photoId,
          content: comment.content,
          generatedAt: comment.generatedAt,
          isEdited: comment.isEdited,
          originalContent: comment.originalContent
        })),
        updatedAt: updatedRecord.updatedAt
      });

      setCurrentRecord(updatedRecord);
      onRecordUpdate?.(updatedRecord);
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      // You might want to show an error message here
    } finally {
      setIsSavingComment(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    setPhotoToDelete(photoId);
    setIsDeletingPhoto(true);
    
    try {
      // Extract original record ID for database operation
      const originalRecordId = currentRecord.id.includes('_photo_') 
        ? currentRecord.id.split('_photo_')[0] 
        : currentRecord.id;
        
      await removePhotoFromGrowthRecord(originalRecordId, photoId);
      
      // Update local state
      const updatedPhotos = currentRecord.photos.filter(photo => photo.id !== photoId);
      const updatedComments = currentRecord.comments.filter(comment => comment.photoId !== photoId);
      
      if (updatedPhotos.length === 0) {
        // If no photos remain, the record was deleted
        onRecordDelete?.(currentRecord.id);
        onClose();
      } else {
        // Update the record with remaining photos
        const updatedRecord = {
          ...currentRecord,
          photos: updatedPhotos,
          comments: updatedComments,
          updatedAt: new Date()
        };
        
        setCurrentRecord(updatedRecord);
        onRecordUpdate?.(updatedRecord);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // You might want to show an error message here
    } finally {
      setIsDeletingPhoto(false);
      setPhotoToDelete(null);
    }
  };

  const formatDate = (date: Date) => {
    if (!isClient) {
      return date.toISOString().split('T')[0]; // Simple format for SSR
    }
    return format(date, 'yyyy年MM月dd日 EEEE', { locale: ja });
  };

  const formatTime = (date: Date) => {
    if (!isClient) {
      return date.toISOString().split('T')[1].substring(0, 5); // Simple format for SSR
    }
    return format(date, 'HH:mm', { locale: ja });
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsPhotoModalOpen(true);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : currentRecord.photos.length - 1
    );
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev < currentRecord.photos.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">
                  {formatDate(currentRecord.createdAt)}
                </h2>
                <p className="text-sm text-neutral-600">
                  {formatTime(currentRecord.createdAt)} に記録
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  削除
                </Button>
                <Button variant="ghost" onClick={onClose} size="sm">
                  ✕
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Photos Section */}
            {currentRecord.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📸 写真 ({currentRecord.photos.length}枚)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentRecord.photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        <div
                          className="cursor-pointer w-full h-full"
                          onClick={() => handlePhotoClick(index)}
                        >
                          <Image
                            src={photo.url}
                            alt={`写真 ${index + 1}`}
                            fill
                            className="object-cover group-hover:opacity-80 transition-opacity"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoDelete(photo.id);
                          }}
                          disabled={isDeletingPhoto && photoToDelete === photo.id}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="写真を削除"
                        >
                          {isDeletingPhoto && photoToDelete === photo.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    💭 コメント ({currentRecord.comments.length}件)
                  </span>
                  {!isGenerating && (
                    <Button
                      onClick={handleGenerateComments}
                      size="sm"
                      className="bg-primary-600 hover:bg-primary-700"
                      disabled={isGenerating}
                    >
                      {currentRecord.comments.length > 0 ? 'コメント再生成' : 'コメント生成'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-medium">エラー</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <Button
                      onClick={handleGenerateComments}
                      size="sm"
                      variant="outline"
                      className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      再試行
                    </Button>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">コメントを生成しました！</span>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      コメントを生成中...
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      AIが写真を分析してコメントを作成しています
                    </p>
                  </div>
                )}

                {/* Comments Display */}
                {!isGenerating && currentRecord.comments.length > 0 && (
                  <div className="space-y-4">
                    {currentRecord.comments.map((comment, index) => (
                      <div
                        key={comment.id}
                        className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary-700">
                            コメント {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {editingCommentId !== comment.id && (
                              <Button
                                onClick={() => handleEditComment(comment.id, comment.content)}
                                size="sm"
                                variant="ghost"
                                className="text-xs text-neutral-500 hover:text-neutral-700 p-1"
                              >
                                編集
                              </Button>
                            )}
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              {comment.isEdited && (
                                <span className="bg-neutral-200 px-2 py-1 rounded">
                                  編集済み
                                </span>
                              )}
                              <span>
                                {isClient 
                                  ? format(comment.generatedAt, 'MM/dd HH:mm', { locale: ja })
                                  : comment.generatedAt.toISOString().substring(5, 16).replace('T', ' ')
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full p-3 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              rows={4}
                              placeholder="コメントを編集..."
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                                disabled={isSavingComment}
                              >
                                キャンセル
                              </Button>
                              <Button
                                onClick={handleSaveComment}
                                size="sm"
                                disabled={isSavingComment || !editingCommentText.trim()}
                                className="bg-primary-600 hover:bg-primary-700"
                              >
                                {isSavingComment ? (
                                  <>
                                    <LoadingSpinner size="sm" className="mr-1" />
                                    保存中...
                                  </>
                                ) : (
                                  '保存'
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-neutral-700 leading-relaxed">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isGenerating && currentRecord.comments.length === 0 && !error && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💭</div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      まだコメントがありません
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4">
                      写真にAIコメントを生成して、成長記録を豊かにしましょう
                    </p>
                    <Button
                      onClick={handleGenerateComments}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      コメント生成
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sharing Info */}
            {currentRecord.isShared && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <span>🔗</span>
                    <span>この記録は共有されています</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {currentRecord.photos.length === 0 && currentRecord.comments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  記録が空です
                </h3>
                <p className="text-neutral-600 text-sm">
                  この記録には写真やコメントがありません。
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Photo Modal */}
      <Modal 
        isOpen={isPhotoModalOpen} 
        onClose={() => setIsPhotoModalOpen(false)}
        size="full"
      >
        <div className="relative h-full bg-black/90 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            onClick={() => setIsPhotoModalOpen(false)}
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
          >
            ✕
          </Button>

          {/* Navigation Buttons */}
          {currentRecord.photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                onClick={handlePrevPhoto}
                className="absolute left-4 z-20 text-white hover:bg-white/20"
              >
                ←
              </Button>
              <Button
                variant="ghost"
                onClick={handleNextPhoto}
                className="absolute right-4 z-20 text-white hover:bg-white/20"
              >
                →
              </Button>
            </>
          )}

          {/* Photo */}
          <div className="relative max-w-full max-h-full">
            <Image
              src={currentRecord.photos[selectedPhotoIndex]?.url || ''}
              alt={`写真 ${selectedPhotoIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>

          {/* Photo Counter */}
          {currentRecord.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedPhotoIndex + 1} / {currentRecord.photos.length}
            </div>
          )}
        </div>
      </Modal>

      {/* Regenerate Comments Confirmation Modal */}
      <Modal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        title="コメントを再生成"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-amber-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              既存のコメントを置き換えますか？
            </h3>
            <p className="text-neutral-600 mb-2">
              現在のコメント（{currentRecord.comments.length}件）が新しいAIコメントに置き換わります
            </p>
            <p className="text-sm text-amber-600">
              この操作は取り消せません
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setShowRegenerateConfirm(false)}
              variant="outline"
              disabled={isGenerating}
            >
              キャンセル
            </Button>
            <Button
              onClick={executeCommentGeneration}
              disabled={isGenerating}
              className="bg-primary-600 hover:bg-primary-700"
            >
              再生成する
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        title="記録を削除"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              本当に削除しますか？
            </h3>
            <p className="text-neutral-600 mb-2">
              {formatDate(currentRecord.createdAt)}の記録を削除します
            </p>
            <p className="text-sm text-red-600">
              この操作は取り消せません
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDeleteCancel}
              variant="outline"
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  削除中...
                </>
              ) : (
                '削除する'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}