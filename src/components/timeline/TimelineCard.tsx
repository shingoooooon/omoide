import { useState, useEffect } from 'react';
import { GrowthRecord } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TimelineCardProps {
  record: GrowthRecord;
  onClick: (record: GrowthRecord) => void;
}

export function TimelineCard({ record, onClick }: TimelineCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    onClick(record);
  };

  const formatDate = (date: Date) => {
    if (!isClient) return ''; // Return empty string during SSR
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ja 
    });
  };

  const formatDateString = (date: Date) => {
    if (!isClient) {
      // Simple format for SSR
      return date.toISOString().split('T')[0];
    }
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const primaryPhoto = record.photos[0];
  const additionalPhotosCount = record.photos.length - 1;
  const primaryComment = record.comments[0];

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer hover:shadow-large transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-neutral-800">
            {formatDateString(record.createdAt)}
          </CardTitle>
          <span className="text-sm text-neutral-500">
            {formatDate(record.createdAt)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Photo Display */}
        {primaryPhoto && (
          <div className="relative mb-4">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden">
              <Image
                src={primaryPhoto.url}
                alt="成長記録の写真"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {additionalPhotosCount > 0 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                +{additionalPhotosCount}枚
              </div>
            )}
          </div>
        )}

        {/* Comment Preview */}
        {primaryComment && (
          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <p className="text-neutral-700 text-sm leading-relaxed">
              {primaryComment.content.length > 120 
                ? `${primaryComment.content.substring(0, 120)}...` 
                : primaryComment.content}
            </p>
            {record.comments.length > 1 && (
              <p className="text-primary-600 text-xs mt-2">
                他 {record.comments.length - 1} 件のコメント
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            詳細を見る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}