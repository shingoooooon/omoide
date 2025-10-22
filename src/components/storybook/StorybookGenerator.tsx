'use client';

import React, { useEffect, useState } from 'react';
import { useStorybookGeneration } from '@/hooks/useStorybookGeneration';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { LoadingCard } from '@/components/ui/FeedbackCard';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { MonthlyStorybookStatus } from '@/lib/storybookUtils';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslations } from '@/lib/translations';
import { useOperationFeedback } from '@/hooks/useOperationFeedback';

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
  
  const feedback = useOperationFeedback({
    showToasts: true,
    steps: [
      { id: 'collect', label: '成長記録を収集中' },
      { id: 'story', label: '物語を生成中' },
      { id: 'illustrations', label: '挿絵を生成中' },
      { id: 'save', label: '絵本を保存中' }
    ]
  });

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
    feedback.startOperation('絵本の生成を開始します');
    
    try {
      // Simulate step progress for better UX
      feedback.setCurrentStep('collect', '今月の成長記録を収集しています...');
      await new Promise(resolve => setTimeout(resolve, 500));
      feedback.completeStep('collect');
      
      feedback.setCurrentStep('story', 'AIが物語を作成しています...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      feedback.completeStep('story');
      
      feedback.setCurrentStep('illustrations', '挿絵を生成しています...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      feedback.completeStep('illustrations');
      
      feedback.setCurrentStep('save', '絵本を保存しています...');
      
      await generateStorybook(userId, month);
      
      feedback.completeStep('save');
      feedback.completeOperation('絵本が完成しました！');
      
      if (state.storybook && onStorybookGenerated) {
        onStorybookGenerated(state.storybook);
      }
    } catch (error) {
      feedback.failOperation(error, '絵本の生成に失敗しました');
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
      <LoadingCard
        title="ステータス確認中"
        message="絵本の作成状況を確認しています..."
        size="md"
      />
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

  if (state.isGenerating || feedback.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingCard
          title="絵本を生成中"
          message={feedback.message || state.progress || '処理を開始しています...'}
          size="lg"
          showIcon={false}
        />
        
        {feedback.hasSteps && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-neutral-700">
                  進捗: {feedback.completedSteps} / {feedback.totalSteps}
                </span>
                <span className="text-neutral-500">
                  {Math.round(feedback.progress)}%
                </span>
              </div>
              
              <ProgressIndicator 
                progress={feedback.progress} 
                showPercentage={false}
                size="sm"
              />
              
              <div className="space-y-2">
                {feedback.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <StepIcon status={step.status} stepNumber={index + 1} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-success-700' :
                        step.status === 'active' ? 'text-primary-700' :
                        step.status === 'error' ? 'text-error-700' :
                        'text-neutral-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.message && (
                        <p className="text-xs text-neutral-500 mt-1">{step.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        
        <div className="text-center">
          <p className="text-sm text-neutral-500">
            絵本の生成には数分かかる場合があります
          </p>
        </div>
      </div>
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
        disabled={feedback.isLoading}
      >
        {feedback.isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span>生成中...</span>
          </div>
        ) : (
          t('storybooks.createStorybook')
        )}
      </Button>
    </Card>
  );
}

// Helper component for step icons
function StepIcon({ status, stepNumber }: { status: string; stepNumber: number }) {
  const baseClasses = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium'

  switch (status) {
    case 'completed':
      return (
        <div className={`${baseClasses} bg-success-500 text-white`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    
    case 'active':
      return (
        <div className={`${baseClasses} bg-primary-500 text-white`}>
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )
    
    case 'error':
      return (
        <div className={`${baseClasses} bg-error-500 text-white`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    
    default: // pending
      return (
        <div className={`${baseClasses} bg-neutral-200 text-neutral-500`}>
          {stepNumber}
        </div>
      )
  }
}