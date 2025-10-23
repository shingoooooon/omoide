'use client';

import { GrowthRecord } from '@/types/models';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import Image from 'next/image';

interface SharedRecordViewProps {
  record: GrowthRecord;
}

export function SharedRecordView({ record }: SharedRecordViewProps) {
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '無効な日付';
      }
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '無効な日付';
    }
  };

  return (
    <div className="space-y-6">
      {/* Record Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="calendar" className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            成長記録
          </h2>
        </div>
        <p className="text-gray-600">
          記録日: {formatDate(record.createdAt)}
        </p>
        {record.updatedAt && record.updatedAt !== record.createdAt && (
          <p className="text-sm text-gray-500 mt-1">
            更新日: {formatDate(record.updatedAt)}
          </p>
        )}
      </Card>

      {/* Photos and Comments */}
      <div className="grid gap-6">
        {record.photos.map((photo, photoIndex) => {
          // Find comments for this photo
          const photoComments = record.comments.filter(
            comment => comment.photoId === photo.id
          );

          return (
            <Card key={photo.id} className="overflow-hidden">
              {/* Photo */}
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={photo.url}
                  alt={`成長記録の写真 ${photoIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Photo Info */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="photo" className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {photo.fileName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(photo.uploadedAt)}
                  </span>
                </div>
                {photo.faceDetected && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">
                      顔検出済み
                    </span>
                  </div>
                )}
              </div>

              {/* Comments */}
              {photoComments.length > 0 && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="chat" className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-gray-900">
                      成長コメント
                    </h4>
                  </div>
                  
                  {photoComments.map((comment) => (
                    <div key={comment.id} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-gray-800 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>
                          {formatDate(comment.generatedAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="flex items-center space-x-1">
                            <Icon name="edit" className="w-3 h-3" />
                            <span>編集済み</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No comments message */}
              {photoComments.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Icon name="chat" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">この写真にはまだコメントがありません</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Record Summary */}
      {record.photos.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-center">
            <Icon name="heart" className="w-8 h-8 text-pink-500 mx-auto mb-3" solid />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              素敵な成長記録
            </h3>
            <p className="text-gray-600">
              {record.photos.length}枚の写真と{record.comments.length}個のコメントが記録されています
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}