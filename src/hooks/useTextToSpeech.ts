import { useState, useCallback } from 'react';

export interface TTSOptions {
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'NEUTRAL' | 'FEMALE' | 'MALE';
}

export interface TTSResult {
  audioUrl: string;
  fileName: string;
  pageId?: string;
  storybookId?: string;
}

export interface UseTextToSpeechReturn {
  generateAudio: (text: string, pageId?: string, storybookId?: string, options?: TTSOptions) => Promise<TTSResult>;
  isGenerating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = useCallback(async (
    text: string,
    pageId?: string,
    storybookId?: string,
    options: TTSOptions = {}
  ): Promise<TTSResult> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          pageId,
          storybookId,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Audio generation failed');
      }

      return {
        audioUrl: result.audioUrl,
        fileName: result.fileName,
        pageId: result.pageId,
        storybookId: result.storybookId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateAudio,
    isGenerating,
    error,
    clearError,
  };
}