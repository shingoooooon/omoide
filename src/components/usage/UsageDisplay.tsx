'use client';

import React, { useState, useEffect } from 'react';
import { getUsageStats, resetUsage } from '@/lib/usageTracker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function UsageDisplay() {
  const [stats, setStats] = useState({
    dailyRequests: 0,
    monthlyRequests: 0,
    lastRequestDate: '',
    estimatedCost: 0
  });

  const updateStats = () => {
    setStats(getUsageStats());
  };

  useEffect(() => {
    updateStats();
    // 1分ごとに更新
    const interval = setInterval(updateStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const dailyLimit = 20;
  const monthlyLimit = 300;
  const dailyPercentage = (stats.dailyRequests / dailyLimit) * 100;
  const monthlyPercentage = (stats.monthlyRequests / monthlyLimit) * 100;

  const handleReset = () => {
    if (window.confirm('使用量統計をリセットしますか？')) {
      resetUsage();
      updateStats();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">API使用量</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs"
        >
          リセット
        </Button>
      </div>

      <div className="space-y-4">
        {/* 今日の使用量 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">今日</span>
            <span className="text-sm text-gray-600">
              {stats.dailyRequests}/{dailyLimit}回
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                dailyPercentage >= 90 ? 'bg-red-500' :
                dailyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 今月の使用量 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">今月</span>
            <span className="text-sm text-gray-600">
              {stats.monthlyRequests}/{monthlyLimit}回
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                monthlyPercentage >= 90 ? 'bg-red-500' :
                monthlyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 推定コスト */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">推定コスト</span>
            <span className="text-sm font-semibold text-green-600">
              ¥{stats.estimatedCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 警告メッセージ */}
        {dailyPercentage >= 80 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              <Icon name="warning" size="sm" className="inline mr-1 text-yellow-600" />
              今日の使用量が制限に近づいています
            </p>
          </div>
        )}

        {monthlyPercentage >= 80 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              🚨 今月の使用量が制限に近づいています
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}