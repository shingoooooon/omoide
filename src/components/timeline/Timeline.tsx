'use client';

import { useState, useEffect, useCallback } from 'react';
import { GrowthRecord } from '@/types/models';
import { TimelineCard } from './TimelineCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getUserGrowthRecords, GrowthRecordListResult } from '@/lib/services/growthRecordService';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentSnapshot } from 'firebase/firestore';

interface TimelineProps {
  onRecordClick: (record: GrowthRecord) => void;
}

export function Timeline({ onRecordClick }: TimelineProps) {
  const { user } = useAuth();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
  const [error, setError] = useState<string | null>(null);

  const loadInitialRecords = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result: GrowthRecordListResult = await getUserGrowthRecords(user.uid, {
        pageSize: 10
      });

      setRecords(result.records);
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('記録の読み込みに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMoreRecords = useCallback(async () => {
    if (!user || !lastDoc) return;

    try {
      setLoadingMore(true);

      const result: GrowthRecordListResult = await getUserGrowthRecords(user.uid, {
        pageSize: 10,
        lastDoc
      });

      setRecords(prev => [...prev, ...result.records]);
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      console.error('Error loading more records:', err);
      setError('記録の読み込みに失敗しました。もう一度お試しください。');
    } finally {
      setLoadingMore(false);
    }
  }, [user, lastDoc]);

  useEffect(() => {
    loadInitialRecords();
  }, [loadInitialRecords]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMoreRecords();
    }
  };

  const handleRetry = () => {
    setError(null);
    loadInitialRecords();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            再試行
          </Button>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-neutral-50 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            まだ記録がありません
          </h3>
          <p className="text-neutral-600 text-sm">
            最初の写真をアップロードして、成長記録を始めましょう！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          成長の記録
        </h2>
        <p className="text-neutral-600">
          {records.length}件の思い出
        </p>
      </div>

      {/* Timeline Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <TimelineCard
            key={record.id}
            record={record}
            onClick={onRecordClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-8">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            isLoading={loadingMore}
            disabled={loadingMore}
          >
            {loadingMore ? '読み込み中...' : 'もっと見る'}
          </Button>
        </div>
      )}

      {/* End Message */}
      {!hasMore && records.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-neutral-500 text-sm">
            すべての記録を表示しました
          </p>
        </div>
      )}
    </div>
  );
}