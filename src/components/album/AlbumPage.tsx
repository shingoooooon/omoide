'use client';

import React from 'react';
import Image from 'next/image';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { AlbumEntry } from './AlbumEntry';
import { Icon } from '@/components/ui/Icon';

interface AlbumPageProps {
  records?: GrowthRecord[];
  childInfo?: ChildInfo;
  photos?: Array<{
    id: string;
    url: string;
    fileName?: string;
    uploadedAt?: Date;
  }>;
  isDemo?: boolean;
}

export function AlbumPage({ records = [], childInfo, photos = [], isDemo = false }: AlbumPageProps) {
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
      <div className="pl-16 pr-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isDemo ? (
            photos.map((photo, index) => (
              <div key={photo.id || index} className="relative">
                <div className="bg-white p-4 rounded-lg shadow-soft border-2 border-amber-200 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                    <Image
                      src={photo.url}
                      alt={photo.fileName || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-amber-800 font-handwriting">
                      {photo.fileName || `思い出 ${index + 1}`}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString('ja-JP') : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            records.map((record, index) => (
              <AlbumEntry 
                key={record.id} 
                record={record} 
                isEven={index % 2 === 0}
                childInfo={childInfo}
              />
            ))
          )}
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-60 transform rotate-12">
          <Icon name="sparkles" size="lg" className="text-amber-400" />
        </div>
        <div className="absolute bottom-4 left-20 opacity-40 transform -rotate-6">
          <Icon name="star" className="text-amber-500" />
        </div>
      </div>
    </div>
  );
}