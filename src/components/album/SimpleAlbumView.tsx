'use client';

import React, { useState } from 'react';
import { GrowthRecord, ChildInfo } from '@/types/models';
import { SimpleAlbumPage } from './SimpleAlbumPage';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface SimpleAlbumViewProps {
  records: GrowthRecord[];
  childInfo?: ChildInfo;
}

export function SimpleAlbumView({ records, childInfo }: SimpleAlbumViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Group records into pages (11 records per page + 1 date header = 12 total)
  const recordsPerPage = 11;
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
        <div className="bg-white rounded-2xl p-8 shadow-lg border max-w-md mx-auto">
          <div className="mb-4 flex justify-center">
            <Icon name="photo" className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            まだ写真がありません
          </h3>
          <p className="text-gray-600">
            写真をアップロードして、素敵なアルバムを作りましょう！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Simple Album Container */}
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* Header with date info */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="calendar" className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold text-gray-800">
                {(() => {
                  const pageRecords = getCurrentPageRecords();
                  if (pageRecords.length === 0) return '';
                  
                  const dates = pageRecords.map(r => new Date(r.createdAt));
                  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
                  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
                  
                  const formatDate = (date: Date) => {
                    return new Intl.DateTimeFormat('ja-JP', {
                      year: 'numeric',
                      month: 'long'
                    }).format(date);
                  };
                  
                  if (minDate.getFullYear() === maxDate.getFullYear() && 
                      minDate.getMonth() === maxDate.getMonth()) {
                    return formatDate(minDate);
                  } else {
                    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
                  }
                })()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {getCurrentPageRecords().length} 枚の写真
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <SimpleAlbumPage records={getCurrentPageRecords()} childInfo={childInfo} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
          variant="outline"
          className="disabled:opacity-50"
        >
          <Icon name="chevron-left" className="w-4 h-4 mr-1" />
          前のページ
        </Button>

        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>
          
          {/* Page Dots */}
          <div className="flex space-x-1">
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageIndex = totalPages <= 5 ? index : 
                currentPage < 3 ? index :
                currentPage > totalPages - 3 ? totalPages - 5 + index :
                currentPage - 2 + index;
              
              return (
                <button
                  key={pageIndex}
                  onClick={() => setCurrentPage(pageIndex)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    pageIndex === currentPage
                      ? 'bg-blue-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <Button
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
          variant="outline"
          className="disabled:opacity-50"
        >
          次のページ
          <Icon name="chevron-right" className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}