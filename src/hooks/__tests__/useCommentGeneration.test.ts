import { renderHook, act } from '@testing-library/react';
import { useCommentGeneration } from '../useCommentGeneration';

// Mock the API client
jest.mock('@/lib/apiClient', () => ({
  generateComments: jest.fn()
}));

describe('useCommentGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCommentGeneration());

    expect(result.current.state.isGenerating).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.comments).toEqual([]);
  });

  it('generates comments successfully', async () => {
    const { generateComments } = require('@/lib/apiClient');
    const mockComments = [
      {
        id: 'comment1',
        photoId: 'photo1',
        content: '素敵な笑顔ですね！',
        generatedAt: new Date(),
        isEdited: false
      }
    ];

    generateComments.mockResolvedValue({ comments: mockComments });

    const { result } = renderHook(() => useCommentGeneration());

    const mockPhotos = [
      {
        id: 'photo1',
        url: 'https://example.com/photo1.jpg',
        fileName: 'photo1.jpg',
        uploadedAt: new Date(),
        faceDetected: true
      }
    ];

    const mockAnalysisData = [
      { faces: [{ confidence: 0.9 }] }
    ];

    await act(async () => {
      await result.current.generateComments(mockPhotos, mockAnalysisData);
    });

    expect(result.current.state.isGenerating).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.comments).toEqual(mockComments);
  });

  it('handles generation errors', async () => {
    const { generateComments } = require('@/lib/apiClient');
    generateComments.mockRejectedValue(new Error('Generation failed'));

    const { result } = renderHook(() => useCommentGeneration());

    const mockPhotos = [
      {
        id: 'photo1',
        url: 'https://example.com/photo1.jpg',
        fileName: 'photo1.jpg',
        uploadedAt: new Date(),
        faceDetected: true
      }
    ];

    await act(async () => {
      await result.current.generateComments(mockPhotos, []);
    });

    expect(result.current.state.isGenerating).toBe(false);
    expect(result.current.state.error).toBe('コメントの生成に失敗しました');
    expect(result.current.state.comments).toEqual([]);
  });

  it('sets loading state during generation', async () => {
    const { generateComments } = require('@/lib/apiClient');
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    generateComments.mockReturnValue(promise);

    const { result } = renderHook(() => useCommentGeneration());

    const mockPhotos = [
      {
        id: 'photo1',
        url: 'https://example.com/photo1.jpg',
        fileName: 'photo1.jpg',
        uploadedAt: new Date(),
        faceDetected: true
      }
    ];

    act(() => {
      result.current.generateComments(mockPhotos, []);
    });

    expect(result.current.state.isGenerating).toBe(true);
    expect(result.current.state.error).toBeNull();

    await act(async () => {
      resolvePromise!({ comments: [] });
      await promise;
    });

    expect(result.current.state.isGenerating).toBe(false);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useCommentGeneration());

    // Set some state
    act(() => {
      result.current.state.comments = [
        {
          id: 'comment1',
          photoId: 'photo1',
          content: 'Test comment',
          generatedAt: new Date(),
          isEdited: false
        }
      ];
      result.current.state.error = 'Some error';
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.isGenerating).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.comments).toEqual([]);
  });

  it('handles empty photos array', async () => {
    const { result } = renderHook(() => useCommentGeneration());

    await act(async () => {
      await result.current.generateComments([], []);
    });

    expect(result.current.state.error).toBe('写真が選択されていません');
  });
});