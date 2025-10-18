'use client';

import { useState, useEffect } from 'react';
import { GrowthRecord } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecordDetailProps {
  record: GrowthRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function RecordDetail({ record, isOpen, onClose }: RecordDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      prev > 0 ? prev - 1 : record.photos.length - 1
    );
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev < record.photos.length - 1 ? prev + 1 : 0
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
                  {formatDate(record.createdAt)}
                </h2>
                <p className="text-sm text-neutral-600">
                  {formatTime(record.createdAt)} に記録
                </p>
              </div>
              <Button variant="ghost" onClick={onClose} size="sm">
                ✕
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Photos Section */}
            {record.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📸 写真 ({record.photos.length}枚)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {record.photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        onClick={() => handlePhotoClick(index)}
                      >
                        <Image
                          src={photo.url}
                          alt={`写真 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            {record.comments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💭 コメント ({record.comments.length}件)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {record.comments.map((comment, index) => (
                      <div
                        key={comment.id}
                        className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary-700">
                            コメント {index + 1}
                          </span>
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
                        <p className="text-neutral-700 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sharing Info */}
            {record.isShared && (
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
            {record.photos.length === 0 && record.comments.length === 0 && (
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
          {record.photos.length > 1 && (
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
              src={record.photos[selectedPhotoIndex]?.url || ''}
              alt={`写真 ${selectedPhotoIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>

          {/* Photo Counter */}
          {record.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedPhotoIndex + 1} / {record.photos.length}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}