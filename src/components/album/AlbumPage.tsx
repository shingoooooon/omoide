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
    comment?: string;
  }>;
  isDemo?: boolean;
}

export function AlbumPage({ records = [], childInfo, photos = [], isDemo = false }: AlbumPageProps) {
  // Debug: Log the photos data
  console.log('AlbumPage - isDemo:', isDemo, 'photos:', photos, 'records:', records);
  
  return (
    <div className="min-h-[600px] bg-gradient-to-br from-blue-50 to-sky-50 relative">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-12">
          {isDemo ? (
            photos.length > 0 ? photos.map((photo, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div key={photo.id || index} className="relative">
                  {/* Photo Frame - matching AlbumEntry style */}
                  <div className={`relative inline-block transform ${isLeft ? 'rotate-1' : '-rotate-2'} hover:rotate-0 transition-transform duration-300`}>
                    {/* Tape Corners */}
                    <div className="absolute -top-2 -left-2 w-8 h-6 bg-yellow-200 opacity-80 transform rotate-45 z-10 shadow-sm"></div>
                    <div className="absolute -top-2 -right-2 w-8 h-6 bg-yellow-200 opacity-80 transform -rotate-45 z-10 shadow-sm"></div>
                    
                    {/* Photo */}
                    <div className="bg-white p-3 shadow-lg border border-gray-200">
                      <div className="relative w-56 h-40 overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={photo.fileName || `Photo ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onLoad={() => console.log('Album image loaded:', photo.url)}
                          onError={(e) => console.error('Album image failed to load:', photo.url, e)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Handwritten Comment - matching AlbumEntry style */}
                  <div className={`mt-4 ${isLeft ? 'ml-2' : 'mr-2'}`}>
                    {/* Date */}
                    <div className="text-sm text-blue-700 font-handwriting mb-2 transform -rotate-1">
                      <div>
                        {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : ''}
                      </div>
                    </div>
                    
                    {/* Comment Bubble */}
                    <div className={`relative bg-blue-50 p-3 rounded-2xl shadow-md border-2 border-blue-200 max-w-xs transform ${isLeft ? 'rotate-1' : '-rotate-1'}`}>
                      {/* Speech Bubble Tail */}
                      <div className={`absolute top-3 ${isLeft ? '-left-2' : '-right-2'} w-4 h-4 bg-blue-50 border-l-2 border-b-2 border-blue-200 transform rotate-45`}></div>
                      
                      {/* Comment Text */}
                      <p className="text-blue-800 font-handwriting leading-relaxed text-sm">
                        {(photo as any).comment || 'まだコメントがありません。'}
                      </p>
                    </div>
                  </div>

                  {/* Decorative Doodles */}
                  <div className={`absolute ${isLeft ? '-right-6 top-6' : '-left-6 top-8'} opacity-40 transform ${isLeft ? 'rotate-12' : '-rotate-12'}`}>
                    {isLeft ? (
                      <Icon name="heart" className="text-pink-400" solid />
                    ) : (
                      <Icon name="star" className="text-sky-400" solid />
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-blue-700 font-handwriting">写真がありません</p>
              </div>
            )
          ) : (
            records.map((record, index) => (
              <div key={record.id} className="relative">
                <AlbumEntry 
                  record={record} 
                  isEven={index % 2 === 0}
                  childInfo={childInfo}
                />
              </div>
            ))
          )}
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-60 transform rotate-12">
          <Icon name="sparkles" size="lg" className="text-blue-400" />
        </div>
        <div className="absolute bottom-4 left-20 opacity-40 transform -rotate-6">
          <Icon name="star" className="text-blue-500" />
        </div>
      </div>
    </div>
  );
}