'use client';

import React from 'react';
import Image from 'next/image';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { SimpleAlbumEntry } from './SimpleAlbumEntry';

interface SimpleAlbumPageProps {
  records?: GrowthRecord[];
  childInfo?: ChildInfo;
  photos?: Array<{
    id: string;
    url: string;
    fileName?: string;
    uploadedAt?: Date;
    comment?: string;
  }>;
  isDemo?: boolean;
}

export function SimpleAlbumPage({ records = [], childInfo, photos = [], isDemo = false }: SimpleAlbumPageProps) {
  // Use photos for demo mode, records for normal mode
  const displayItems = isDemo ? photos : records;
  
  // Check if we need to add a date header for the first item
  const shouldShowDateHeader = displayItems.length > 0;
  const firstItemDate = shouldShowDateHeader ? 
    (isDemo ? new Date() : new Date(displayItems[0].createdAt)) : null;

  return (
    <div className="min-h-[700px] bg-black p-4">
      {/* Grid Layout - 4x3 grid with space for comments */}
      <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
        {/* Date header in first cell if we have records */}
        {shouldShowDateHeader && (isDemo || firstItemDate) && (
          <div className="flex flex-col">
            <div className="aspect-square bg-white flex flex-col items-center justify-center text-center border-4 border-white shadow-lg">
              <div className="text-gray-600 text-sm font-medium mb-1">
                {isDemo ? 'デモ' : (firstItemDate ? new Intl.DateTimeFormat('ja-JP', { month: 'long' }).format(firstItemDate) : '')}
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {isDemo ? '📸' : (firstItemDate ? firstItemDate.getDate() : '')}
              </div>
              <div className="text-gray-600 text-sm">
                {isDemo ? '2024' : firstItemDate?.getFullYear()}
              </div>
            </div>
            {/* Empty space for alignment with photo entries that have comments */}
            <div className="bg-black px-3 py-4 min-h-[4rem]"></div>
          </div>
        )}
        
        {/* Photo entries */}
        {isDemo ? (
          photos.slice(0, shouldShowDateHeader ? 11 : 12).map((photo, index) => (
            <div key={photo.id || index} className="flex flex-col">
              <div className="aspect-square bg-white border-4 border-white shadow-lg overflow-hidden relative">
                <Image
                  src={photo.url}
                  alt={photo.fileName || `Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-black px-3 py-4 min-h-[4rem] flex items-center justify-center">
                {(photo as any).comment ? (
                  <p className="text-white text-sm leading-relaxed text-center font-handwriting">
                    {(photo as any).comment}
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs text-center font-handwriting opacity-60">
                    コメントなし
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          records.slice(0, shouldShowDateHeader ? 11 : 12).map((record) => (
            <SimpleAlbumEntry 
              key={record.id} 
              record={record} 
              childInfo={childInfo}
            />
          ))
        )}
        
        {/* Fill empty slots to maintain 4x3 grid */}
        {Array.from({ length: 12 - displayItems.length - (shouldShowDateHeader ? 1 : 0) }).map((_, index) => (
          <div key={`empty-${index}`} className="flex flex-col">
            <div className="aspect-square"></div>
            <div className="bg-black px-3 py-4 min-h-[4rem]"></div>
          </div>
        ))}
      </div>
    </div>
  );
}