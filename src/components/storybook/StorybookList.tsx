'use client';

import React, { useState, useEffect } from 'react';
import { Storybook } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { getUserStorybooks, deleteStorybook, StorybookListResult } from '@/lib/services/storybookService';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslations } from '@/lib/translations';
import Image from 'next/image';

interface StorybookListProps {
  userId: string;
  onStorybookSelect?: (storybook: Storybook) => void;
  onCreateNew?: () => void;
}

interface StorybookCardProps {
  storybook: Storybook;
  onView: (storybook: Storybook) => void;
  onDelete: (storybook: Storybook) => void;
}

function StorybookCard({ storybook, onView, onDelete }: StorybookCardProps) {
  const { locale } = useLocale();
  const { t } = useTranslations(locale);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    if (locale === 'ja') {
      return `${year}年${parseInt(month)}月`;
    } else {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const thumbnailImage = storybook.coverImageUrl || storybook.pages[0]?.imageUrl;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {thumbnailImage && !imageError ? (
          <>
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            <Image
              src={thumbnailImage}
              alt={`${storybook.title}のサムネイル`}
              fill
              className="object-cover"
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-purple-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm">{t('navigation.storybooks')}</p>
            </div>
          </div>
        )}
        
        {/* Page count badge */}
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium text-purple-700">
          {storybook.pages.length} {t('storybooks.pages')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2">
            {storybook.title}
          </h3>
          <p className="text-sm text-purple-600 font-medium">
            {formatMonth(storybook.month)}
          </p>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {t('storybooks.createdDate')}: {formatDate(storybook.createdAt)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onView(storybook)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('storybooks.view')}
          </Button>
          <Button
            onClick={() => onDelete(storybook)}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
            aria-label={t('storybooks.delete')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function StorybookList({ userId, onStorybookSelect, onCreateNew }: StorybookListProps) {
  const { locale } = useLocale();
  const { t } = useTranslations(locale);
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storybookToDelete, setStorybookToDelete] = useState<Storybook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStorybooks();
  }, [userId]);

  const loadStorybooks = async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result: StorybookListResult = await getUserStorybooks(userId, {
        pageSize: 6,
        lastDoc: loadMore ? lastDoc : undefined
      });

      if (loadMore) {
        setStorybooks(prev => [...prev, ...result.storybooks]);
      } else {
        setStorybooks(result.storybooks);
      }

      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      console.error('Error loading storybooks:', err);
      setError(t('storybooks.loadError'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleDeleteClick = (storybook: Storybook) => {
    setStorybookToDelete(storybook);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storybookToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStorybook(storybookToDelete.id);
      setStorybooks(prev => prev.filter(s => s.id !== storybookToDelete.id));
      setDeleteModalOpen(false);
      setStorybookToDelete(null);
    } catch (err) {
      console.error('Error deleting storybook:', err);
      setError(t('storybooks.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setStorybookToDelete(null);
  };

  const handleViewStorybook = (storybook: Storybook) => {
    onStorybookSelect?.(storybook);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">{t('storybooks.loadingStorybooks')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => loadStorybooks()} variant="outline">
          {t('timeline.retry')}
        </Button>
      </div>
    );
  }

  if (storybooks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-purple-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t('storybooks.noStorybooks')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('storybooks.noStorybooksDescription')}
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700">
            {t('storybooks.createStorybook')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('storybooks.title')}</h2>
          <p className="text-gray-600">
            {storybooks.length} {t('storybooks.count')}
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('storybooks.createNew')}
          </Button>
        )}
      </div>

      {/* Storybook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storybooks.map((storybook) => (
          <StorybookCard
            key={storybook.id}
            storybook={storybook}
            onView={handleViewStorybook}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={() => loadStorybooks(true)}
            disabled={isLoadingMore}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t('timeline.loading')}
              </>
            ) : (
              t('timeline.loadMore')
            )}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title={t('storybooks.deleteConfirmTitle')}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('storybooks.deleteConfirmMessage')}
            </h3>
            <p className="text-gray-600 mb-2">
              「{storybookToDelete?.title}」{locale === 'ja' ? 'を削除します' : ' will be deleted'}
            </p>
            <p className="text-sm text-red-600">
              {t('storybooks.deleteConfirmDescription')}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDeleteCancel}
              variant="outline"
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('storybooks.deleting')}
                </>
              ) : (
                t('storybooks.delete')
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}