'use client';

import React, { useState, useEffect } from 'react';
import { GrowthRecord } from '@/types/models';
import { getAllGrowthRecords } from '@/lib/services/growthRecordService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlbumView } from '@/components/album/AlbumView';

export default function AlbumsPage() {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const allRecords = await getAllGrowthRecords();
      // Sort by creation date (newest first)
      const sortedRecords = allRecords.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecords(sortedRecords);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('記録の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRecords}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 font-handwriting">
            📖 思い出アルバム
          </h1>
          <p className="text-amber-700 text-lg font-handwriting">
            大切な成長の記録を手書き風アルバムで振り返ろう
          </p>
        </div>

        <AlbumView records={records} />
      </div>
    </div>
  );
}