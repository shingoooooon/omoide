'use client';

import React from 'react';

interface PlaceholderIllustrationProps {
  pageNumber: number;
  text?: string;
  className?: string;
}

export function PlaceholderIllustration({ 
  pageNumber, 
  text, 
  className = '' 
}: PlaceholderIllustrationProps) {
  return (
    <div className={`bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg 
            className="w-8 h-8 text-purple-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <div className="text-purple-600 font-medium mb-2">
          ページ {pageNumber}
        </div>
        {text && (
          <div className="text-sm text-purple-500 max-w-xs">
            {text}
          </div>
        )}
        <div className="text-xs text-purple-400 mt-2">
          挿絵を準備中...
        </div>
      </div>
    </div>
  );
}