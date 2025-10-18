import { useState } from 'react';
import { Storybook } from '@/types/models';

interface StorybookGenerationState {
  isGenerating: boolean;
  progress: string;
  error: string | null;
  storybook: Storybook | null;
}

interface UseStorybookGenerationReturn {
  state: StorybookGenerationState;
  generateStorybook: (userId: string, month: string) => Promise<void>;
  reset: () => void;
}

export function useStorybookGeneration(): UseStorybookGenerationReturn {
  const [state, setState] = useState<StorybookGenerationState>({
    isGenerating: false,
    progress: '',
    error: null,
    storybook: null,
  });

  const generateStorybook = async (userId: string, month: string) => {
    setState({
      isGenerating: true,
      progress: '今月の写真を収集しています...',
      error: null,
      storybook: null,
    });

    try {
      // Call the API to generate storybook
      const response = await fetch('/api/generate-storybook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, month }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '絵本の生成に失敗しました');
      }

      setState(prev => ({
        ...prev,
        progress: '物語を生成しています...',
      }));

      const data = await response.json();

      setState(prev => ({
        ...prev,
        progress: '挿絵を生成しています...',
      }));

      // The API handles both story and illustration generation
      setState({
        isGenerating: false,
        progress: '絵本が完成しました！',
        error: null,
        storybook: data.storybook,
      });

    } catch (error) {
      console.error('Storybook generation error:', error);
      setState({
        isGenerating: false,
        progress: '',
        error: error instanceof Error ? error.message : '絵本の生成中にエラーが発生しました',
        storybook: null,
      });
    }
  };

  const reset = () => {
    setState({
      isGenerating: false,
      progress: '',
      error: null,
      storybook: null,
    });
  };

  return {
    state,
    generateStorybook,
    reset,
  };
}