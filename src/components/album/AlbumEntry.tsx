'use client';

import React from 'react';
import Image from 'next/image';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { calculateAge, hasBirthDate } from '@/lib/ageUtils';
import { Icon } from '@/components/ui/Icon';

interface AlbumEntryProps {
  record: GrowthRecord;
  isEven: boolean;
  childInfo?: ChildInfo;
}

export function AlbumEntry({ record, isEven, childInfo }: AlbumEntryProps) {
  const mainPhoto = record.photos[0];
  const mainComment = record.comments[0];
  
  if (!mainPhoto || !mainComment) {
    return null;
  }

  const recordDate = new Date(record.createdAt);
  const formattedDate = format(recordDate, 'yyyy年M月d日', { locale: ja });
  
  // Calculate age if birth date is available
  const ageInfo = childInfo && hasBirthDate(childInfo.birthDate) 
    ? calculateAge(childInfo.birthDate, recordDate)
    : null;

  return (
    <div className={`relative ${isEven ? 'ml-0' : 'ml-8'}`}>
      {/* Photo Frame */}
      <div className={`relative inline-block transform ${isEven ? 'rotate-1' : '-rotate-2'} hover:rotate-0 transition-transform duration-300`}>
        {/* Tape Corners */}
        <div className="absolute -top-2 -left-2 w-8 h-6 bg-yellow-200 opacity-80 transform rotate-45 z-10 shadow-sm"></div>
        <div className="absolute -top-2 -right-2 w-8 h-6 bg-yellow-200 opacity-80 transform -rotate-45 z-10 shadow-sm"></div>
        
        {/* Photo */}
        <div className="bg-white p-3 shadow-lg border border-gray-200">
          <div className="relative w-64 h-48 overflow-hidden">
            <Image
              src={mainPhoto.url}
              alt={`思い出の写真 - ${formattedDate}`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Handwritten Comment */}
      <div className={`mt-4 ${isEven ? 'ml-4' : 'mr-4'}`}>
        {/* Date and Age */}
        <div className="text-sm text-amber-700 font-handwriting mb-2 transform -rotate-1">
          <div>{formattedDate}</div>
          {ageInfo && (
            <div className="text-xs text-amber-600 mt-1">
              ({ageInfo.displayText})
            </div>
          )}
        </div>
        
        {/* Comment Bubble */}
        <div className={`relative bg-yellow-100 p-4 rounded-2xl shadow-md border-2 border-yellow-200 max-w-xs transform ${isEven ? 'rotate-1' : '-rotate-1'}`}>
          {/* Speech Bubble Tail */}
          <div className={`absolute top-4 ${isEven ? '-left-2' : '-right-2'} w-4 h-4 bg-yellow-100 border-l-2 border-b-2 border-yellow-200 transform rotate-45`}></div>
          
          {/* Comment Text */}
          <p className="text-amber-800 font-handwriting leading-relaxed text-sm">
            {mainComment.content}
          </p>
        </div>
      </div>



      {/* Decorative Doodles */}
      <div className={`absolute ${isEven ? '-right-8 top-8' : '-left-8 top-12'} opacity-40 transform ${isEven ? 'rotate-12' : '-rotate-12'}`}>
        {isEven ? (
          <Icon name="heart" className="text-pink-400" solid />
        ) : (
          <Icon name="star" className="text-yellow-400" solid />
        )}
      </div>
    </div>
  );
}