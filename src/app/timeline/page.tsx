'use client';

import { useState } from 'react';
import { GrowthRecord } from '@/types/models';
import { Timeline } from '@/components/timeline/Timeline';
import { RecordDetail } from '@/components/timeline/RecordDetail';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TimelinePage() {
  const [selectedRecord, setSelectedRecord] = useState<GrowthRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleRecordClick = (record: GrowthRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedRecord(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4 py-8">
          <Timeline onRecordClick={handleRecordClick} />
          
          {selectedRecord && (
            <RecordDetail
              record={selectedRecord}
              isOpen={isDetailOpen}
              onClose={handleCloseDetail}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}