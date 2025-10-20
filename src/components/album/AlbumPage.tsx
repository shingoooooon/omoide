'use client';

import React from 'react';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { AlbumEntry } from './AlbumEntry';

interface AlbumPageProps {
  records: GrowthRecord[];
  childInfo?: ChildInfo;
}

export function AlbumPage({ records, childInfo }: AlbumPageProps) {
  return (
    <div className="min-h-[600px] bg-gradient-to-br from-cream-50 to-yellow-50 relative">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 opacity-30 bg-paper-texture"></div>
      
      {/* Spiral Holes */}
      <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-evenly">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full shadow-inner"></div>
        ))}
      </div>

      {/* Page Content */}
      <div className="pl-16 pr-8 py-8 space-y-8">
        {records.map((record, index) => (
          <AlbumEntry 
            key={record.id} 
            record={record} 
            isEven={index % 2 === 0}
            childInfo={childInfo}
          />
        ))}
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 text-2xl opacity-60 transform rotate-12">
          ✨
        </div>
        <div className="absolute bottom-4 left-20 text-xl opacity-40 transform -rotate-6">
          🌟
        </div>
      </div>
    </div>
  );
}