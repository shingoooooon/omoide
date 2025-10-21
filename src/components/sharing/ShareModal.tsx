'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { ShareLink } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'record' | 'storybook';
  contentTitle?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle
}: ShareModalProps) {
  const { user } = useAuth();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load existing share links when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadShareLinks();
    }
  }, [isOpen, contentId, contentType, user]);

  const loadShareLinks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/manage-share-link?contentId=${contentId}&contentType=${contentType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setShareLinks(data.shareLinks);
      } else {
        throw new Error('Failed to load share links');
      }
    } catch (error) {
      console.error('Error loading share links:', error);
      setToast({ message: '共有リンクの読み込みに失敗しました', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const createShareLink = async () => {
    if (!user) {
      setToast({ message: 'ログインが必要です', type: 'error' });
      return;
    }

    setIsCreating(true);
    try {
      const requestBody: any = {
        contentId,
        contentType,
        userId: user.uid
      };

      if (expirationDate) {
        requestBody.expiresAt = new Date(expirationDate).toISOString();
      }

      const response = await fetch('/api/create-share-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setToast({ message: '共有リンクを作成しました', type: 'success' });
        setExpirationDate('');
        await loadShareLinks(); // Reload the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      setToast({ 
        message: error instanceof Error ? error.message : '共有リンクの作成に失敗しました', 
        type: 'error' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast({ message: 'リンクをコピーしました', type: 'success' });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setToast({ message: 'コピーに失敗しました', type: 'error' });
    }
  };

  const toggleShareLink = async (shareId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/manage-share-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareId,
          isActive: !currentStatus
        }),
      });

      if (response.ok) {
        setToast({ 
          message: `共有リンクを${!currentStatus ? '有効' : '無効'}にしました`, 
          type: 'success' 
        });
        await loadShareLinks();
      } else {
        throw new Error('Failed to update share link');
      }
    } catch (error) {
      console.error('Error updating share link:', error);
      setToast({ message: '共有リンクの更新に失敗しました', type: 'error' });
    }
  };

  const deleteShareLink = async (shareId: string) => {
    if (!confirm('この共有リンクを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/manage-share-link?shareId=${shareId}&contentId=${contentId}&contentType=${contentType}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setToast({ message: '共有リンクを削除しました', type: 'success' });
        await loadShareLinks();
      } else {
        throw new Error('Failed to delete share link');
      }
    } catch (error) {
      console.error('Error deleting share link:', error);
      setToast({ message: '共有リンクの削除に失敗しました', type: 'error' });
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '無効な日付';
      }
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '無効な日付';
    }
  };

  const getShareUrl = (shareId: string) => {
    return `${window.location.origin}/share/${shareId}`;
  };

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="共有設定">
        <div className="p-6 text-center">
          <Icon name="warning" className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ログインが必要です
          </h3>
          <p className="text-gray-600 mb-4">
            共有機能を使用するにはログインしてください。
          </p>
          <Button onClick={onClose}>
            閉じる
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="共有設定">
        <div className="space-y-6">
          {/* Content info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">
              {contentType === 'record' ? '成長記録' : 'えほん'}を共有
            </h3>
            {contentTitle && (
              <p className="text-sm text-gray-600">{contentTitle}</p>
            )}
          </div>

          {/* Create new share link */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">新しい共有リンクを作成</h4>
            
            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-2">
                有効期限（オプション）
              </label>
              <Input
                id="expiration"
                type="datetime-local"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                設定しない場合は無期限で有効です
              </p>
            </div>

            <Button
              onClick={createShareLink}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  作成中...
                </>
              ) : (
                <>
                  <Icon name="plus" className="w-4 h-4 mr-2" />
                  共有リンクを作成
                </>
              )}
            </Button>
          </div>

          {/* Existing share links */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">既存の共有リンク</h4>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : shareLinks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                共有リンクはまだありません
              </p>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <div
                    key={link.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          link.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium">
                          {link.isActive ? '有効' : '無効'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShareLink(link.id, link.isActive)}
                        >
                          {link.isActive ? '無効にする' : '有効にする'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteShareLink(link.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          削除
                        </Button>
                      </div>
                    </div>

                    {link.isActive && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            value={getShareUrl(link.id)}
                            readOnly
                            className="flex-1 text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(getShareUrl(link.id))}
                          >
                            <Icon name="copy" className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>作成日: {formatDate(link.createdAt)}</p>
                      {link.expiresAt && (
                        <p>有効期限: {formatDate(link.expiresAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          id="share-toast"
          title={toast.type === 'success' ? '成功' : 'エラー'}
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}