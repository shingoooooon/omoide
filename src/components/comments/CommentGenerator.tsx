'use client';

import React, { useState } from 'react';
import { 
  generateCommentsForPhotos, 
  GrowthComment, 
  Photo 
} from '@/lib/commentGenerationService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LoadingCard } from '@/components/ui/FeedbackCard';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { useOperationFeedback } from '@/hooks/useOperationFeedback';

interface CommentGeneratorProps {
  photos: Photo[];
  analysisDataArray: any[];
  onCommentsGenerated: (comments: GrowthComment[]) => void;
  disabled?: boolean;
}

export function CommentGenerator({ 
  photos, 
  analysisDataArray, 
  onCommentsGenerated,
  disabled = false
}: CommentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const feedback = useOperationFeedback({
    showToasts: true,
    steps: [
      { id: 'analyze', label: '写真を解析中' },
      { id: 'generate', label: 'AIコメントを生成中' },
      { id: 'process', label: 'コメントを処理中' }
    ]
  });

  const handleGenerateComments = async () => {
    if (photos.length === 0 || analysisDataArray.length === 0) {
      setError('写真と解析データが必要です');
      return;
    }

    setIsGenerating(true);
    setError(null);
    feedback.startOperation('AIコメントの生成を開始します');

    try {
      feedback.setCurrentStep('analyze', '写真を解析しています...');
      await new Promise(resolve => setTimeout(resolve, 500));
      feedback.completeStep('analyze');
      
      feedback.setCurrentStep('generate', 'AIがコメントを生成しています...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await generateCommentsForPhotos(photos, analysisDataArray);
      
      feedback.completeStep('generate');
      feedback.setCurrentStep('process', 'コメントを処理しています...');
      
      if (result.success) {
        feedback.completeStep('process');
        feedback.completeOperation('コメントの生成が完了しました');
        onCommentsGenerated(result.comments);
      } else {
        const errorMsg = result.error || 'コメント生成に失敗しました';
        setError(errorMsg);
        feedback.failStep('process', new Error(errorMsg));
      }
    } catch (error) {
      console.error('コメント生成エラー:', error);
      const errorMsg = '予期しないエラーが発生しました';
      setError(errorMsg);
      feedback.failOperation(error, errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 生成ボタン */}
      <div className="text-center">
        <Button
          onClick={handleGenerateComments}
          disabled={disabled || isGenerating || photos.length === 0}
          className="px-6 py-3"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>AIコメントを生成中...</span>
            </div>
          ) : (
            'AIコメントを生成する'
          )}
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-red-800 font-medium">エラーが発生しました</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 生成中の詳細表示 */}
      {(isGenerating || feedback.isLoading) && (
        <div className="space-y-4">
          <LoadingCard
            title="AIコメント生成中"
            message={feedback.message || '写真を解析して、心温まる成長コメントを作成中です...'}
            size="md"
            showIcon={false}
          />
          
          {feedback.hasSteps && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-primary-700">
                    進捗: {feedback.completedSteps} / {feedback.totalSteps}
                  </span>
                  <span className="text-primary-600">
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
            </div>
          )}
        </div>
      )}

      {/* 使用方法の説明 */}
      {!isGenerating && photos.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-800 font-medium mb-2">AIコメント生成について</h4>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• アップロードされた写真を解析して、成長コメントを自動生成します</li>
            <li>• 生成されたコメントは後から編集できます</li>
            <li>• {photos.length}枚の写真に対してコメントを生成します</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper component for step icons
function StepIcon({ status, stepNumber }: { status: string; stepNumber: number }) {
  const baseClasses = 'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium'

  switch (status) {
    case 'completed':
      return (
        <div className={`${baseClasses} bg-success-500 text-white`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    
    case 'active':
      return (
        <div className={`${baseClasses} bg-primary-500 text-white`}>
          <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )
    
    case 'error':
      return (
        <div className={`${baseClasses} bg-error-500 text-white`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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