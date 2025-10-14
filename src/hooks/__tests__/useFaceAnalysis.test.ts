import { renderHook, act } from '@testing-library/react';
import { useFaceAnalysis, useFaceDetectionValidator } from '../useFaceAnalysis';
import { FaceAnalysisClient } from '@/lib/faceAnalysisClient';

// Mock the FaceAnalysisClient
jest.mock('@/lib/faceAnalysisClient');

const mockFaceAnalysisClient = FaceAnalysisClient as jest.Mocked<typeof FaceAnalysisClient>;

describe('useFaceAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFaceAnalysis());

    expect(result.current.state).toEqual({
      isAnalyzing: false,
      results: [],
      validCount: 0,
      totalCount: 0,
      error: null,
    });
  });

  it('should analyze photos successfully', async () => {
    const mockResponse = {
      success: true,
      results: [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          evaluation: {
            isValid: true,
            confidence: 0.9,
            reason: '高品質な顔検出結果です',
          },
          analysisId: 'analysis-1',
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          evaluation: {
            isValid: false,
            confidence: 0,
            reason: '顔が検出されませんでした',
            suggestions: ['明るい場所で撮影してください'],
          },
        },
      ],
      validCount: 1,
      totalCount: 2,
    };

    mockFaceAnalysisClient.processPhotos.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useFaceAnalysis());

    await act(async () => {
      await result.current.analyzePhotos('user123', [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ]);
    });

    expect(result.current.state.isAnalyzing).toBe(false);
    expect(result.current.state.results).toEqual(mockResponse.results);
    expect(result.current.state.validCount).toBe(1);
    expect(result.current.state.totalCount).toBe(2);
    expect(result.current.state.error).toBeNull();
  });

  it('should handle analysis errors', async () => {
    const errorMessage = 'Network error';
    mockFaceAnalysisClient.processPhotos.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useFaceAnalysis());

    await act(async () => {
      await result.current.analyzePhotos('user123', ['https://example.com/photo.jpg']);
    });

    expect(result.current.state.isAnalyzing).toBe(false);
    expect(result.current.state.error).toBe(errorMessage);
    expect(result.current.state.results).toEqual([]);
  });

  it('should analyze single photo successfully', async () => {
    const mockResult = {
      imageUrl: 'https://example.com/photo.jpg',
      evaluation: {
        isValid: true,
        confidence: 0.8,
        reason: '顔検出が成功しました',
      },
      analysisId: 'analysis-1',
    };

    mockFaceAnalysisClient.processSinglePhoto.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useFaceAnalysis());

    let singleResult;
    await act(async () => {
      singleResult = await result.current.analyzeSinglePhoto('user123', 'https://example.com/photo.jpg');
    });

    expect(singleResult).toEqual(mockResult);
    expect(result.current.state.results).toEqual([mockResult]);
    expect(result.current.state.validCount).toBe(1);
    expect(result.current.state.totalCount).toBe(1);
  });

  it('should check photo suitability', async () => {
    const mockSuitabilityResult = {
      suitable: ['https://example.com/photo1.jpg'],
      unsuitable: ['https://example.com/photo2.jpg'],
      suggestions: ['明るい場所で撮影してください'],
    };

    mockFaceAnalysisClient.checkPhotoSuitability.mockResolvedValueOnce(mockSuitabilityResult);

    const { result } = renderHook(() => useFaceAnalysis());

    let suitabilityResult;
    await act(async () => {
      suitabilityResult = await result.current.checkPhotoSuitability('user123', [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ]);
    });

    expect(suitabilityResult).toEqual(mockSuitabilityResult);
  });

  it('should get valid photos', () => {
    const { result } = renderHook(() => useFaceAnalysis());

    // Set up state with mixed results
    act(() => {
      result.current.state.results = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          evaluation: { isValid: true, confidence: 0.9, reason: 'Valid' },
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          evaluation: { isValid: false, confidence: 0, reason: 'Invalid' },
        },
        {
          imageUrl: 'https://example.com/photo3.jpg',
          evaluation: { isValid: true, confidence: 0.8, reason: 'Valid' },
        },
      ];
    });

    const validPhotos = result.current.getValidPhotos();
    expect(validPhotos).toEqual([
      'https://example.com/photo1.jpg',
      'https://example.com/photo3.jpg',
    ]);
  });

  it('should get invalid photos with reasons', () => {
    const { result } = renderHook(() => useFaceAnalysis());

    // Set up state with mixed results
    act(() => {
      result.current.state.results = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          evaluation: { isValid: true, confidence: 0.9, reason: 'Valid' },
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          evaluation: { 
            isValid: false, 
            confidence: 0, 
            reason: '顔が検出されませんでした',
            suggestions: ['明るい場所で撮影してください'],
          },
        },
      ];
    });

    const invalidPhotos = result.current.getInvalidPhotos();
    expect(invalidPhotos).toEqual([
      {
        url: 'https://example.com/photo2.jpg',
        reason: '顔が検出されませんでした',
        suggestions: ['明るい場所で撮影してください'],
      },
    ]);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useFaceAnalysis());

    // Set up some state
    act(() => {
      result.current.state.results = [
        {
          imageUrl: 'https://example.com/photo.jpg',
          evaluation: { isValid: true, confidence: 0.9, reason: 'Valid' },
        },
      ];
      result.current.state.validCount = 1;
      result.current.state.totalCount = 1;
      result.current.state.error = 'Some error';
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({
      isAnalyzing: false,
      results: [],
      validCount: 0,
      totalCount: 0,
      error: null,
    });
  });
});

describe('useFaceDetectionValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFaceDetectionValidator());

    expect(result.current.isValidating).toBe(false);
    expect(result.current.validationResults).toEqual({});
  });

  it('should validate photo successfully', async () => {
    const mockResult = {
      imageUrl: 'https://example.com/photo.jpg',
      evaluation: {
        isValid: true,
        confidence: 0.8,
        reason: '顔検出が成功しました',
      },
      analysisId: 'analysis-1',
    };

    mockFaceAnalysisClient.processSinglePhoto.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useFaceDetectionValidator());

    let isValid;
    await act(async () => {
      isValid = await result.current.validatePhoto('user123', 'https://example.com/photo.jpg');
    });

    expect(isValid).toBe(true);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.validationResults['https://example.com/photo.jpg']).toEqual({
      isValid: true,
      confidence: 0.8,
      reason: '顔検出が成功しました',
      suggestions: undefined,
    });
  });

  it('should handle validation errors', async () => {
    const errorMessage = 'Validation failed';
    mockFaceAnalysisClient.processSinglePhoto.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useFaceDetectionValidator());

    let isValid;
    await act(async () => {
      isValid = await result.current.validatePhoto('user123', 'https://example.com/photo.jpg');
    });

    expect(isValid).toBe(false);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.validationResults['https://example.com/photo.jpg']).toEqual({
      isValid: false,
      confidence: 0,
      reason: errorMessage,
      suggestions: ['写真を再度確認してください'],
    });
  });

  it('should get validation result', () => {
    const { result } = renderHook(() => useFaceDetectionValidator());

    // Set up validation results
    act(() => {
      result.current.validationResults['https://example.com/photo.jpg'] = {
        isValid: true,
        confidence: 0.9,
        reason: 'Valid',
      };
    });

    const validationResult = result.current.getValidationResult('https://example.com/photo.jpg');
    expect(validationResult).toEqual({
      isValid: true,
      confidence: 0.9,
      reason: 'Valid',
    });

    const nonExistentResult = result.current.getValidationResult('https://example.com/nonexistent.jpg');
    expect(nonExistentResult).toBeNull();
  });

  it('should clear validation results', () => {
    const { result } = renderHook(() => useFaceDetectionValidator());

    // Set up validation results
    act(() => {
      result.current.validationResults['https://example.com/photo.jpg'] = {
        isValid: true,
        confidence: 0.9,
        reason: 'Valid',
      };
    });

    act(() => {
      result.current.clearValidationResults();
    });

    expect(result.current.validationResults).toEqual({});
  });
});