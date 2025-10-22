/**
 * Demo component showcasing the new loading and feedback features
 * This demonstrates the implementation of requirement 8.3
 */

'use client'

import React, { useState } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { LoadingOverlay } from './LoadingOverlay'
import { FeedbackCard, LoadingCard, SuccessCard, ErrorCard, EmptyCard } from './FeedbackCard'
import { ProgressIndicator, StepProgress, MultiStepProgress } from './ProgressIndicator'
import { useOperationFeedback } from '@/hooks/useOperationFeedback'

export function LoadingFeedbackDemo() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentDemo, setCurrentDemo] = useState<string | null>(null)

  const feedback = useOperationFeedback({
    showToasts: true,
    steps: [
      { id: 'step1', label: 'データを準備中' },
      { id: 'step2', label: '処理を実行中' },
      { id: 'step3', label: '結果を保存中' }
    ]
  })

  const simulateOperation = async () => {
    setShowOverlay(true)
    feedback.startOperation('デモ操作を開始します')
    
    try {
      // Step 1
      feedback.setCurrentStep('step1', 'データを準備しています...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      feedback.completeStep('step1')
      
      // Step 2
      feedback.setCurrentStep('step2', '処理を実行しています...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      feedback.completeStep('step2')
      
      // Step 3
      feedback.setCurrentStep('step3', '結果を保存しています...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      feedback.completeStep('step3')
      
      feedback.completeOperation('操作が完了しました！')
    } catch (error) {
      feedback.failOperation(error, '操作に失敗しました')
    } finally {
      setShowOverlay(false)
    }
  }

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const steps = [
    { label: 'ファイルを選択', status: 'completed' as const },
    { label: 'アップロード中', status: 'active' as const },
    { label: '処理完了', status: 'pending' as const }
  ]

  return (
    <div className="space-y-8 p-6">
      <LoadingOverlay
        isVisible={showOverlay}
        title="デモ操作実行中"
        message={feedback.message}
        variant="steps"
        steps={feedback.steps}
        backdrop="blur"
      />

      <div>
        <h2 className="text-2xl font-bold mb-4">Loading & Feedback Components Demo</h2>
        <p className="text-neutral-600 mb-6">
          新しいローディング状態とフィードバック機能のデモンストレーション
        </p>
      </div>

      {/* Operation Demo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Operation Feedback Demo</h3>
        <div className="space-y-4">
          <Button onClick={simulateOperation} disabled={feedback.isLoading}>
            {feedback.isLoading ? 'デモ実行中...' : 'デモ操作を実行'}
          </Button>
          
          {feedback.hasSteps && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <StepProgress steps={feedback.steps} />
            </div>
          )}
        </div>
      </Card>

      {/* Progress Indicators */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Indicators</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Linear Progress</h4>
            <ProgressIndicator 
              progress={progress} 
              label="ファイル処理中"
              showPercentage={true}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Circular Progress</h4>
            <ProgressIndicator 
              progress={progress} 
              variant="circular"
              showPercentage={true}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Multi-Step Progress</h4>
            <MultiStepProgress
              currentStep={2}
              totalSteps={5}
              stepLabels={['開始', '準備', '実行', '完了', '終了']}
            />
          </div>
          
          <Button onClick={simulateProgress} size="sm">
            進捗をシミュレート
          </Button>
        </div>
      </Card>

      {/* Feedback Cards */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Feedback Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingCard
            title="処理中"
            message="データを読み込んでいます..."
            size="sm"
          />
          
          <SuccessCard
            title="完了"
            message="操作が正常に完了しました"
            size="sm"
            actions={[
              { label: '続行', onClick: () => {}, variant: 'primary' }
            ]}
          />
          
          <ErrorCard
            title="エラー"
            message="処理中にエラーが発生しました"
            size="sm"
            actions={[
              { label: '再試行', onClick: () => {}, variant: 'primary' },
              { label: 'キャンセル', onClick: () => {}, variant: 'outline' }
            ]}
          />
          
          <EmptyCard
            title="データなし"
            message="表示するデータがありません"
            size="sm"
            actions={[
              { label: '新規作成', onClick: () => {}, variant: 'primary' }
            ]}
          />
        </div>
      </Card>

      {/* Step Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Step Progress</h3>
        <StepProgress steps={steps} />
      </Card>
    </div>
  )
}

export default LoadingFeedbackDemo