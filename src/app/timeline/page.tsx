'use client';

import { useState } from 'react';
import { GrowthRecord } from '@/types/models';
import { Timeline } from '@/components/timeline/Timeline';
import { RecordDetail } from '@/components/timeline/RecordDetail';
import { Layout } from '@/components/layout/Layout';

export default function TimelinePage() {
  const [selectedRecord, setSelectedRecord] = useState<GrowthRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecordClick = (record: GrowthRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedRecord(null);
  };

  const handleRecordDelete = (recordId: string) => {
    // Trigger a refresh of the timeline
    setRefreshKey(prev => prev + 1);
    setIsDetailOpen(false);
    setSelectedRecord(null);
  };

  return (
    <Layout>
      <Timeline 
        key={refreshKey} 
        onRecordClick={handleRecordClick} 
      />
      
      {selectedRecord && (
        <RecordDetail
          record={selectedRecord}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onRecordUpdate={(updatedRecord) => {
            setSelectedRecord(updatedRecord);
            // Optionally trigger a refresh of the timeline
          }}
          onRecordDelete={handleRecordDelete}
        />
      )}
    </Layout>
  );
}