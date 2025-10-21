'use client';

import React from 'react';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { SimpleAlbumEntry } from './SimpleAlbumEntry';

interface SimpleAlbumPageProps {
  records: GrowthRecord[];
  childInfo?: ChildInfo;
}

export function SimpleAlbumPage({ records, childInfo }: SimpleAlbumPageProps) {
  // Check if we need to add a date header for the first record
  const shouldShowDateHeader = records.length > 0;
  const firstRecordDate = shouldShowDateHeader ? new Date(records[0].createdAt) : null;

  return (
    <div className="min-h-[700px] bg-black p-4">
      {/* Grid Layout - 4x3 grid with space for comments */}
      <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
        {/* Date header in first cell if we have records */}
        {shouldShowDateHeader && firstRecordDate && (
          <div className="flex flex-col">
            <div className="aspect-square bg-white flex flex-col items-center justify-center text-center border-4 border-white shadow-lg">
              <div className="text-gray-600 text-sm font-medium mb-1">
                {new Intl.DateTimeFormat('ja-JP', { month: 'long' }).format(firstRecordDate)}
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {firstRecordDate.getDate()}
              </div>
              <div className="text-gray-600 text-sm">
                {firstRecordDate.getFullYear()}
              </div>
            </div>
            {/* Empty space for alignment with photo entries that have comments */}
            <div className="bg-black px-3 py-4 min-h-[4rem]"></div>
          </div>
        )}
        
        {/* Photo entries */}
        {records.slice(0, shouldShowDateHeader ? 11 : 12).map((record) => (
          <SimpleAlbumEntry 
            key={record.id} 
            record={record} 
            childInfo={childInfo}
          />
        ))}
        
        {/* Fill empty slots to maintain 4x3 grid */}
        {Array.from({ length: 12 - records.length - (shouldShowDateHeader ? 1 : 0) }).map((_, index) => (
          <div key={`empty-${index}`} className="flex flex-col">
            <div className="aspect-square"></div>
            <div className="bg-black px-3 py-4 min-h-[4rem]"></div>
          </div>
        ))}
      </div>
    </div>
  );
}