'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GrowthRecord, Storybook, ShareLink } from '@/types/models';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { SharedRecordView, SharedStorybookView } from '@/components/sharing';

interface SharedContentData {
  shareLink: {
    id: string;
    contentType: 'record' | 'storybook';
    createdAt: string;
    expiresAt?: string;
  };
  content: GrowthRecord | Storybook;
}

export default function SharedContentPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [data, setData] = useState<SharedContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; reason?: string } | null>(null);

  useEffect(() => {
    if (shareId) {
      fetchSharedContent();
    }
  }, [shareId]);

  const fetchSharedContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/shared-content/${shareId}`);
      
      if (response.ok) {
        const contentData = await response.json();
        setData(contentData);
      } else {
        const errorData = await response.json();
        setError({
          message: errorData.error || 'コンテンツの読み込みに失敗しました',
          reason: errorData.reason
        });
      }
    } catch (error) {
      console.error('Error fetching shared content:', error);
      setError({
        message: 'ネットワークエラーが発生しました'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">共有コンテンツを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Icon name="warning" className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            コンテンツが見つかりません
          </h1>
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
          {error.reason && (
            <p className="text-sm text-gray-500 mb-6">
              {error.reason}
            </p>
          )}
          <div className="space-y-2 text-sm text-gray-500">
            <p>考えられる原因：</p>
            <ul className="text-left space-y-1">
              <li>• 共有リンクが無効または期限切れです</li>
              <li>• コンテンツが削除されました</li>
              <li>• 共有が無効化されました</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-8">
          <Icon name="warning" className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            データが見つかりません
          </h1>
          <p className="text-gray-600">
            共有コンテンツのデータを取得できませんでした。
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon 
                name={data.shareLink.contentType === 'record' ? 'photo' : 'book'} 
                className="w-6 h-6 text-pink-500" 
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {data.shareLink.contentType === 'record' ? '成長記録' : 'えほん'}
                </h1>
                <p className="text-sm text-gray-500">
                  共有日: {formatDate(data.shareLink.createdAt)}
                  {data.shareLink.expiresAt && (
                    <span className="ml-2">
                      • 有効期限: {formatDate(data.shareLink.expiresAt)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Icon name="link" className="w-4 h-4" />
              <span>共有コンテンツ</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {data.shareLink.contentType === 'record' ? (
          <SharedRecordView record={data.content as GrowthRecord} />
        ) : (
          <SharedStorybookView storybook={data.content as Storybook} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            このコンテンツは Omoide で作成され、共有されています
          </p>
        </div>
      </footer>
    </div>
  );
}