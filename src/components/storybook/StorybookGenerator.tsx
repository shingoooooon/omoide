'use client';

import React, { useEffect, useState } from 'react';
import { useStorybookGeneration } from '@/hooks/useStorybookGeneration';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { MonthlyStorybookStatus } from '@/lib/storybookUtils';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslations } from '@/lib/translations';

interface StorybookGeneratorProps {
  userId: string;
  month: string; // YYYY-MM format
  onStorybookGenerated?: (storybook: any) => void;
}

export function StorybookGenerator({ 
  userId, 
  month, 
  onStorybookGenerated 
}: StorybookGeneratorProps) {
  const { locale } = useLocale();
  const { t } = useTranslations(locale);
  const { state, generateStorybook, reset } = useStorybookGeneration();
  const [status, setStatus] = useState<MonthlyStorybookStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkStorybookStatus();
  }, [userId, month]);

  const checkStorybookStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/storybook-status?userId=${userId}&month=${month}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      } else {
        console.error('Status check failed:', data.error);
      }
    } catch (error) {
      console.error('Error checking storybook status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleGenerateStorybook = async () => {
    await generateStorybook(userId, month);
    if (state.storybook && onStorybookGenerated) {
      onStorybookGenerated(state.storybook);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    if (locale === 'ja') {
      return `${year}年${parseInt(month)}月`;
    } else {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  if (isCheckingStatus) {
    return (
      <Card className="p-6 text-center">
        <LoadingSpinner size="md" className="mx-auto mb-4" />
        <p className="text-gray-600">{t('storybooks.generator.checkingStatus')}</p>
      </Card>
    );
  }

  if (status && status.hasStorybook) {
    return (
      <Card className="p-6 text-center border-blue-200 bg-blue-50">
        <div className="text-blue-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-blue-800">
          {formatMonth(month)} {t('storybooks.generator.alreadyExists')}
        </h3>
        <p className="text-blue-700 mb-4">
          {t('storybooks.generator.alreadyExistsDescription')}
        </p>
      </Card>
    );
  }

  if (status && !status.canCreateStorybook) {
    return (
      <Card className="p-6 text-center border-yellow-200 bg-yellow-50">
        <div className="text-yellow-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">
          {formatMonth(month)} {t('storybooks.generator.cannotCreate')}
        </h3>
        <p className="text-yellow-700 mb-4">
          {status.message}
        </p>
        {!status.hasRecords && (
          <p className="text-sm text-yellow-600">
            {t('storybooks.generator.noRecordsMessage')}
          </p>
        )}
        {status.hasRecords && status.commentCount === 0 && (
          <p className="text-sm text-yellow-600">
            {t('storybooks.generator.noCommentsMessage')}
          </p>
        )}
      </Card>
    );
  }

  if (state.isGenerating) {
    return (
      <Card className="p-6 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('storybooks.generator.generating')}</h3>
        <p className="text-gray-600">{state.progress}</p>
        <div className="mt-4 text-sm text-gray-500">
          {t('storybooks.generator.generatingNote')}
        </div>
      </Card>
    );
  }

  if (state.error) {
    return (
      <Card className="p-6 text-center border-red-200 bg-red-50">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-800">{t('storybooks.generator.error')}</h3>
        <p className="text-red-700 mb-4">{state.error}</p>
        <Button 
          onClick={reset}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          {t('storybooks.generator.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (state.storybook) {
    return (
      <Card className="p-6 text-center border-green-200 bg-green-50">
        <div className="text-green-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-green-800">{t('storybooks.generator.completed')}</h3>
        <p className="text-green-700 mb-4">
          「{state.storybook.title}」{t('storybooks.generator.completedMessage')}
        </p>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={() => onStorybookGenerated?.(state.storybook)}
            className="bg-green-600 hover:bg-green-700"
          >
            {t('storybooks.generator.viewStorybook')}
          </Button>
          <Button 
            onClick={reset}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            {t('storybooks.generator.createAnother')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {t('storybooks.generator.prompt')} {formatMonth(month)}?
      </h3>
      <p className="text-gray-600 mb-6">
        {t('storybooks.generator.promptDescription')}
      </p>
      <Button 
        onClick={handleGenerateStorybook}
        size="lg"
        className="bg-purple-600 hover:bg-purple-700"
      >
        {t('storybooks.createStorybook')}
      </Button>
    </Card>
  );
}