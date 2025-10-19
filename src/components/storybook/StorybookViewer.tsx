'use client';

import React, { useState, useEffect } from 'react';
import { Storybook, StorybookPage } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

interface StorybookViewerProps {
  storybook: Storybook;
  onClose?: () => void;
}

export function StorybookViewer({ storybook, onClose }: StorybookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset to first page when storybook changes
  useEffect(() => {
    setCurrentPage(0);
  }, [storybook.id]);

  const totalPages = storybook.pages.length;
  const currentPageData = storybook.pages[currentPage];

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setIsImageLoading(true);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setIsImageLoading(true);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      setIsImageLoading(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight') {
        goToNextPage();
      } else if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, onClose]);

  if (!currentPageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="p-8 text-center">
          <p className="text-gray-600">絵本のページが見つかりません</p>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              戻る
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-purple-800 mb-1">
              {storybook.title}
            </h1>
            <p className="text-purple-600 text-sm">
              {storybook.month.replace('-', '年')}月の絵本
            </p>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              閉じる
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg">
          {/* Page Content */}
          <div className="relative">
            {/* Image Section */}
            <div className="relative h-96 bg-gray-100 flex items-center justify-center">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              )}
              <Image
                src={currentPageData.imageUrl}
                alt={`絵本のページ ${currentPage + 1}`}
                fill
                className="object-contain"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                priority={currentPage === 0}
              />
            </div>

            {/* Text Section */}
            <div className="p-8 bg-white">
              <p className="text-lg leading-relaxed text-gray-800 text-center font-medium">
                {currentPageData.text}
              </p>
            </div>

            {/* Navigation Arrows */}
            {currentPage > 0 && (
              <button
                onClick={goToPreviousPage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="前のページ"
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {currentPage < totalPages - 1 && (
              <button
                onClick={goToNextPage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="次のページ"
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </Card>

        {/* Page Navigation */}
        <div className="mt-6 flex items-center justify-center space-x-4">
          {/* Page Indicators */}
          <div className="flex space-x-2">
            {storybook.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentPage
                    ? 'bg-purple-600 scale-125'
                    : 'bg-purple-300 hover:bg-purple-400'
                }`}
                aria-label={`ページ ${index + 1}へ移動`}
              />
            ))}
          </div>

          {/* Page Counter */}
          <div className="text-sm text-purple-600 font-medium">
            {currentPage + 1} / {totalPages}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            前のページ
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              キーボードの矢印キーでもページを移動できます
            </p>
          </div>

          <Button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次のページ
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}