import { renderHook, act } from '@testing-library/react';
import { useTextToSpeech } from '../useTextToSpeech';

// Mock fetch
global.fetch = jest.fn();

describe('useTextToSpeech', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTextToSpeech());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.generateAudio).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should generate audio successfully', async () => {
    const mockResponse = {
      success: true,
      audioUrl: 'https://example.com/audio.mp3',
      fileName: 'audio_123.mp3',
      pageId: 'page-1',
      storybookId: 'storybook-1',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTextToSpeech());

    let audioResult;
    await act(async () => {
      audioResult = await result.current.generateAudio(
        'こんにちは、世界！',
        'page-1',
        'storybook-1'
      );
    });

    expect(fetch).toHaveBeenCalledWith('/api/generate-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'こんにちは、世界！',
        pageId: 'page-1',
        storybookId: 'storybook-1',
        options: {},
      }),
    });

    expect(audioResult).toEqual({
      audioUrl: 'https://example.com/audio.mp3',
      fileName: 'audio_123.mp3',
      pageId: 'page-1',
      storybookId: 'storybook-1',
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors', async () => {
    const mockErrorResponse = {
      error: 'Failed to generate audio',
      details: 'TTS service unavailable',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    });

    const { result } = renderHook(() => useTextToSpeech());

    await act(async () => {
      try {
        await result.current.generateAudio('テストテキスト');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Failed to generate audio');
      }
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe('Failed to generate audio');
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTextToSpeech());

    await act(async () => {
      try {
        await result.current.generateAudio('テストテキスト');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should set isGenerating to true during API call', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (fetch as jest.Mock).mockReturnValueOnce(promise);

    const { result } = renderHook(() => useTextToSpeech());

    act(() => {
      result.current.generateAudio('テストテキスト');
    });

    expect(result.current.isGenerating).toBe(true);

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          audioUrl: 'test.mp3',
          fileName: 'test.mp3',
        }),
      });
      await promise;
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('should pass custom options to API', async () => {
    const mockResponse = {
      success: true,
      audioUrl: 'https://example.com/audio.mp3',
      fileName: 'audio_123.mp3',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTextToSpeech());

    const customOptions = {
      languageCode: 'en-US',
      voiceName: 'en-US-Wavenet-A',
      ssmlGender: 'FEMALE' as const,
    };

    await act(async () => {
      await result.current.generateAudio(
        'Hello world',
        'page-1',
        'storybook-1',
        customOptions
      );
    });

    expect(fetch).toHaveBeenCalledWith('/api/generate-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        pageId: 'page-1',
        storybookId: 'storybook-1',
        options: customOptions,
      }),
    });
  });

  it('should clear error when clearError is called', async () => {
    const { result } = renderHook(() => useTextToSpeech());

    // First trigger an error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Test error' }),
    });

    await act(async () => {
      try {
        await result.current.generateAudio('test');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should handle unsuccessful API response', async () => {
    const mockResponse = {
      success: false,
      error: 'Audio generation failed',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTextToSpeech());

    await act(async () => {
      try {
        await result.current.generateAudio('テストテキスト');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Audio generation failed');
      }
    });

    expect(result.current.error).toBe('Audio generation failed');
  });
});