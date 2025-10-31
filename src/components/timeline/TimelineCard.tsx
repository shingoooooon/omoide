import { useState, useEffect } from 'react';
import { GrowthRecord } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslations } from '@/lib/translations';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

interface TimelineCardProps {
  record: GrowthRecord;
  onClick: (record: GrowthRecord) => void;
}

export function TimelineCard({ record, onClick }: TimelineCardProps) {
  const [isClient, setIsClient] = useState(false);
  const { locale } = useLocale();
  const { t } = useTranslations(locale);

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
      locale: locale === 'ja' ? ja : enUS
    });
  };

  const formatDateString = (date: Date) => {
    if (!isClient) {
      // Simple format for SSR
      return date.toISOString().split('T')[0];
    }
    const localeString = locale === 'ja' ? 'ja-JP' : 'en-US';
    return new Date(date).toLocaleDateString(localeString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const primaryPhoto = record.photos[0];
  const primaryComment = record.comments[0];

  // アイコンと色を決定する関数
  const getRecordIconAndColor = () => {
    if (primaryComment?.content.includes('笑顔')) {
      return { icon: 'heart', color: 'from-pink-400 to-pink-600' };
    }
    if (primaryComment?.content.includes('ハイハイ')) {
      return { icon: 'chevron-right', color: 'from-blue-400 to-blue-600' };
    }
    if (primaryComment?.content.includes('歩') || primaryComment?.content.includes('一歩')) {
      return { icon: 'user', color: 'from-green-400 to-green-600' };
    }
    if (primaryComment?.content.includes('座') || primaryComment?.content.includes('お座り')) {
      return { icon: 'user', color: 'from-yellow-400 to-yellow-600' };
    }
    if (primaryComment?.content.includes('遊') || primaryComment?.content.includes('おもちゃ')) {
      return { icon: 'star', color: 'from-purple-400 to-purple-600' };
    }
    if (primaryComment?.content.includes('眠') || primaryComment?.content.includes('寝')) {
      return { icon: 'sparkles', color: 'from-indigo-400 to-indigo-600' };
    }
    return { icon: 'camera', color: 'from-primary-400 to-primary-600' }; // デフォルト
  };

  const { icon, color } = getRecordIconAndColor();

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer hover:shadow-large transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-full flex items-center justify-center shadow-sm`}>
              <Icon name={icon} className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg text-neutral-800">
              {formatDateString(record.createdAt)}
            </CardTitle>
          </div>
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
                alt={locale === 'ja' ? '成長記録の写真' : 'Growth record photo'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

          </div>
        )}

        {/* Comment Preview */}
        {primaryComment ? (
          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <p className="text-neutral-700 text-sm leading-relaxed">
              {primaryComment.content.length > 120 
                ? `${primaryComment.content.substring(0, 120)}...` 
                : primaryComment.content}
            </p>
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-lg p-4 mb-4">
            <p className="text-neutral-500 text-sm italic">
              {t('timelineCard.generateComment')}
            </p>
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
            {t('timelineCard.viewDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}