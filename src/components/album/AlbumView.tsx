'use client';

import React, { useState } from 'react';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { AlbumPage } from './AlbumPage';
import { Button } from '@/components/ui/Button';

interface AlbumViewProps {
  records: GrowthRecord[];
  childInfo?: ChildInfo;
}

export function AlbumView({ records, childInfo }: AlbumViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Group records into pages (4 records per page for individual photo layout)
  const recordsPerPage = 4;
  const totalPages = Math.ceil(records.length / recordsPerPage);
  
  const getCurrentPageRecords = () => {
    const startIndex = currentPage * recordsPerPage;
    return records.slice(startIndex, startIndex + recordsPerPage);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-dashed border-amber-300 max-w-md mx-auto">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-bold text-amber-800 mb-2 font-handwriting">
            まだ写真がありません
          </h3>
          <p className="text-amber-700 font-handwriting">
            写真をアップロードして、素敵なアルバムを作りましょう！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Album Book */}
      <div className="relative">
        {/* Book Shadow */}
        <div className="absolute inset-0 bg-amber-900/20 rounded-2xl transform rotate-1 translate-x-2 translate-y-2"></div>
        
        {/* Book Cover */}
        <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-2xl border-4 border-amber-200 overflow-hidden">
          {/* Book Binding */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-amber-300 to-amber-500 border-r-2 border-amber-400">
            <div className="flex flex-col justify-center h-full space-y-4 px-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-amber-600 rounded-full mx-auto"></div>
              ))}
            </div>
          </div>

          {/* Page Content */}
          <div className="ml-8 p-8">
            <AlbumPage records={getCurrentPageRecords()} childInfo={childInfo} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
          variant="outline"
          className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 disabled:opacity-50 font-handwriting"
        >
          ← 前のページ
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-amber-700 font-handwriting">
            {currentPage + 1} / {totalPages}
          </span>
          
          {/* Page Dots */}
          <div className="flex space-x-1 ml-4">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentPage
                    ? 'bg-amber-500 scale-125'
                    : 'bg-amber-300 hover:bg-amber-400'
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
          variant="outline"
          className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 disabled:opacity-50 font-handwriting"
        >
          次のページ →
        </Button>
      </div>
    </div>
  );
}