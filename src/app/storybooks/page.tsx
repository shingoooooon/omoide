'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { StorybookList, StorybookViewer, StorybookGenerator } from '@/components/storybook';
import { Storybook } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslations } from '@/lib/translations';

type ViewMode = 'list' | 'viewer' | 'generator';

export default function StorybooksPage() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const { t } = useTranslations(locale);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedStorybook, setSelectedStorybook] = useState<Storybook | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleStorybookSelect = (storybook: Storybook) => {
    setSelectedStorybook(storybook);
    setViewMode('viewer');
  };

  const handleCreateNew = () => {
    setViewMode('generator');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStorybook(null);
  };

  const handleStorybookGenerated = (storybook: Storybook) => {
    setSelectedStorybook(storybook);
    setViewMode('viewer');
  };

  return (
    <Layout>
      {viewMode === 'list' && user && (
        <StorybookList
          userId={user.uid}
          onStorybookSelect={handleStorybookSelect}
          onCreateNew={handleCreateNew}
        />
      )}

      {viewMode === 'viewer' && selectedStorybook && (
        <div className="fixed inset-0 z-50">
          <StorybookViewer
            storybook={selectedStorybook}
            onClose={handleBackToList}
          />
        </div>
      )}

      {viewMode === 'generator' && user && (
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-purple-800">
                {t('storybooks.generator.title')}
              </h1>
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('storybooks.generator.backToList')}
              </Button>
            </div>

            {/* Month Selector */}
            <div className="mb-6">
              <label htmlFor="month-select" className="block text-sm font-medium text-purple-700 mb-2">
                {t('storybooks.generator.selectMonth')}
              </label>
              <select
                id="month-select"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="block w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const displayStr = locale === 'ja' 
                    ? `${date.getFullYear()}年${date.getMonth() + 1}月`
                    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                  return (
                    <option key={monthStr} value={monthStr}>
                      {displayStr}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Generator */}
          <StorybookGenerator
            userId={user.uid}
            month={currentMonth}
            onStorybookGenerated={handleStorybookGenerated}
          />
        </div>
      )}
    </Layout>
  );
}