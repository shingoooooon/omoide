'use client';

import React from 'react';
import Image from 'next/image';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { calculateAge, hasBirthDate } from '@/lib/ageUtils';

interface SimpleAlbumEntryProps {
  record: GrowthRecord;
  childInfo?: ChildInfo;
}

export function SimpleAlbumEntry({ record, childInfo }: SimpleAlbumEntryProps) {
  const mainPhoto = record.photos[0];
  const mainComment = record.comments[0];
  
  if (!mainPhoto) {
    return null;
  }

  const recordDate = new Date(record.createdAt);
  const formattedDate = format(recordDate, 'd', { locale: ja });
  
  // Calculate age if birth date is available
  const ageInfo = childInfo && hasBirthDate(childInfo.birthDate) 
    ? calculateAge(childInfo.birthDate, recordDate)
    : null;

  return (
    <div className="group cursor-pointer flex flex-col">
      {/* Photo Container */}
      <div className="relative aspect-square overflow-hidden border-4 border-white shadow-lg bg-white">
        <Image
          src={mainPhoto.url}
          alt={`思い出の写真 - ${formattedDate}日`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Subtle overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
        
        {/* Date in top-left */}
        <div className="absolute top-2 left-2 text-white text-xs font-bold drop-shadow-lg">
          {formattedDate}
        </div>
        
        {/* Age in top-right */}
        {ageInfo && (
          <div className="absolute top-2 right-2 text-white text-xs drop-shadow-lg">
            {ageInfo.displayText}
          </div>
        )}
      </div>
      
      {/* Comment area below photo with proper spacing */}
      <div className="bg-black px-3 py-4 min-h-[4rem] flex items-center justify-center">
        {mainComment ? (
          <p className="text-white text-sm leading-relaxed text-center font-handwriting">
            {mainComment.content}
          </p>
        ) : (
          <p className="text-gray-400 text-xs text-center font-handwriting opacity-60">
            コメントなし
          </p>
        )}
      </div>
    </div>
  );
}