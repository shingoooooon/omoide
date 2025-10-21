'use client';

import { useState } from 'react';
import { Storybook } from '@/types/models';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import Image from 'next/image';

interface SharedStorybookViewProps {
  storybook: Storybook;
}

export function SharedStorybookView({ storybook }: SharedStorybookViewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '無効な日付';
      }
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '無効な日付';
    }
  };

  const formatMonth = (monthString: string) => {
    try {
      const [year, month] = monthString.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1);
      if (isNaN(dateObj.getTime())) {
        return monthString;
      }
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long'
      }).format(dateObj);
    } catch (error) {
      console.error('Month formatting error:', error);
      return monthString;
    }
  };

  const goToNextPage = () => {
    if (currentPage < storybook.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const currentPageData = storybook.pages[currentPage];

  if (storybook.pages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon name="book" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {storybook.title}
        </h2>
        <p className="text-gray-600">
          この絵本にはページがありません
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storybook Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="book" className="w-6 h-6 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {storybook.title}
            </h1>
            <p className="text-gray-600">
              {formatMonth(storybook.month)}の思い出
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>作成日: {formatDate(storybook.createdAt)}</span>
          <span>{storybook.pages.length}ページ</span>
        </div>
      </Card>

      {/* Main Storybook Viewer */}
      <Card className="overflow-hidden">
        {/* Page Content */}
        <div className="relative">
          {/* Page Image */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50">
            {currentPageData.imageUrl ? (
              <Image
                src={currentPageData.imageUrl}
                alt={`絵本のページ ${currentPage + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Icon name="photo" className="w-16 h-16 text-gray-300" />
              </div>
            )}
            
            {/* Page Number Overlay */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentPage + 1} / {storybook.pages.length}
            </div>
          </div>

          {/* Page Text */}
          <div className="p-6 bg-white">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed text-center">
                {currentPageData.text}
              </p>
            </div>

            {/* Audio Player */}
            {currentPageData.audioUrl && (
              <div className="mt-6 flex justify-center">
                <AudioPlayer
                  src={currentPageData.audioUrl}
                  title={`ページ ${currentPage + 1} の音声`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="flex items-center space-x-2"
            >
              <Icon name="chevron-left" className="w-4 h-4" />
              <span>前のページ</span>
            </Button>

            {/* Page Indicators */}
            <div className="flex items-center space-x-2">
              {storybook.pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentPage
                      ? 'bg-purple-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`ページ ${index + 1}に移動`}
                />
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === storybook.pages.length - 1}
              className="flex items-center space-x-2"
            >
              <span>次のページ</span>
              <Icon name="chevron-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Page List (for easy navigation) */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Icon name="bookmark" className="w-5 h-5 text-purple-500" />
          <span>ページ一覧</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {storybook.pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => goToPage(index)}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                index === currentPage
                  ? 'border-purple-500 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {page.imageUrl ? (
                <Image
                  src={page.imageUrl}
                  alt={`ページ ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <Icon name="photo" className="w-8 h-8 text-gray-300" />
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
                ページ {index + 1}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Storybook Info */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="text-center">
          <Icon name="sparkles" className="w-8 h-8 text-purple-500 mx-auto mb-3" solid />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            素敵な絵本
          </h3>
          <p className="text-gray-600">
            {formatMonth(storybook.month)}の思い出が{storybook.pages.length}ページの絵本になりました
          </p>
        </div>
      </Card>
    </div>
  );
}