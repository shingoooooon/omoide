import { FaceAnalysisClient, ProcessFaceAnalysisResponse } from '../faceAnalysisClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('FaceAnalysisClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processPhotos', () => {
    it('should successfully process photos', async () => {
      const mockResponse: ProcessFaceAnalysisResponse = {
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const userId = 'user123';
      const photoUrls = ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'];
      const result = await FaceAnalysisClient.processPhotos(userId, photoUrls);

      expect(fetch).toHaveBeenCalledWith('/api/process-face-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, photoUrls }),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error for missing user ID', async () => {
      await expect(
        FaceAnalysisClient.processPhotos('', ['https://example.com/photo.jpg'])
      ).rejects.toThrow('User ID is required');
    });

    it('should throw error for empty photo URLs array', async () => {
      await expect(
        FaceAnalysisClient.processPhotos('user123', [])
      ).rejects.toThrow('At least one photo URL is required');
    });

    it('should handle API error responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Invalid request',
        }),
      });

      await expect(
        FaceAnalysisClient.processPhotos('user123', ['https://example.com/photo.jpg'])
      ).rejects.toThrow('Invalid request');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        FaceAnalysisClient.processPhotos('user123', ['https://example.com/photo.jpg'])
      ).rejects.toThrow('Network error');
    });
  });

  describe('processSinglePhoto', () => {
    it('should process a single photo', async () => {
      const mockResponse: ProcessFaceAnalysisResponse = {
        success: true,
        results: [
          {
            imageUrl: 'https://example.com/photo.jpg',
            evaluation: {
              isValid: true,
              confidence: 0.8,
              reason: '顔検出が成功しました',
            },
            analysisId: 'analysis-1',
          },
        ],
        validCount: 1,
        totalCount: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await FaceAnalysisClient.processSinglePhoto(
        'user123',
        'https://example.com/photo.jpg'
      );

      expect(result).toEqual(mockResponse.results[0]);
    });

    it('should throw error when no results returned', async () => {
      const mockResponse: ProcessFaceAnalysisResponse = {
        success: true,
        results: [],
        validCount: 0,
        totalCount: 0,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(
        FaceAnalysisClient.processSinglePhoto('user123', 'https://example.com/photo.jpg')
      ).rejects.toThrow('No analysis result returned');
    });
  });

  describe('getValidFaceAnalyses', () => {
    it('should return only valid face analyses', async () => {
      const mockResponse: ProcessFaceAnalysisResponse = {
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
            },
          },
          {
            imageUrl: 'https://example.com/photo3.jpg',
            evaluation: {
              isValid: true,
              confidence: 0.8,
              reason: '顔検出が成功しました',
            },
            analysisId: 'analysis-3',
          },
        ],
        validCount: 2,
        totalCount: 3,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const validResults = await FaceAnalysisClient.getValidFaceAnalyses(
        'user123',
        ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg', 'https://example.com/photo3.jpg']
      );

      expect(validResults).toHaveLength(2);
      expect(validResults[0].imageUrl).toBe('https://example.com/photo1.jpg');
      expect(validResults[1].imageUrl).toBe('https://example.com/photo3.jpg');
    });
  });

  describe('getAnalysisResultsWithErrors', () => {
    it('should categorize results into valid and invalid', async () => {
      const mockResponse: ProcessFaceAnalysisResponse = {
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
            },
            error: {
              message: 'No face detected',
              suggestions: ['Try better lighting'],
              canRetry: true,
            },
          },
          {
            imageUrl: 'https://example.com/photo3.jpg',
            evaluation: {
              isValid: false,
              confidence: 0.3,
              reason: '顔の検出精度が低すぎます',
            },
            error: {
              message: 'Low confidence',
              suggestions: ['Use higher resolution'],
              canRetry: false,
            },
          },
        ],
        validCount: 1,
        totalCount: 3,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await FaceAnalysisClient.getAnalysisResultsWithErrors(
        'user123',
        ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg', 'https://example.com/photo3.jpg']
      );

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(2);
      expect(result.summary.totalCount).toBe(3);
      expect(result.summary.validCount).toBe(1);
      expect(result.summary.invalidCount).toBe(2);
      expect(result.summary.retryableCount).toBe(1);
    });
  });

  describe('checkPhotoSuitability', () => {
    it('should categorize photos as suitable or unsuitable', async () => {
      const mockResponse: ProcessFaceAnalysisResponse = {
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
              isValid: true,
              confidence: 0.6, // Lower than 0.7 threshold
              reason: '顔検出が成功しました',
              suggestions: ['画像の解像度を上げてください'],
            },
            analysisId: 'analysis-2',
          },
          {
            imageUrl: 'https://example.com/photo3.jpg',
            evaluation: {
              isValid: false,
              confidence: 0,
              reason: '顔が検出されませんでした',
              suggestions: ['明るい場所で撮影してください'],
            },
            error: {
              message: 'No face detected',
              suggestions: ['Try better lighting'],
              canRetry: true,
            },
          },
        ],
        validCount: 2,
        totalCount: 3,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await FaceAnalysisClient.checkPhotoSuitability(
        'user123',
        ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg', 'https://example.com/photo3.jpg']
      );

      expect(result.suitable).toEqual(['https://example.com/photo1.jpg']);
      expect(result.unsuitable).toEqual(['https://example.com/photo2.jpg', 'https://example.com/photo3.jpg']);
      expect(result.suggestions).toContain('画像の解像度を上げてください');
      expect(result.suggestions).toContain('明るい場所で撮影してください');
      expect(result.suggestions).toContain('Try better lighting');
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const result = await FaceAnalysisClient.checkPhotoSuitability(
        'user123',
        ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
      );

      expect(result.suitable).toEqual([]);
      expect(result.unsuitable).toEqual(['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']);
      expect(result.suggestions).toContain('写真の品質を確認してください');
      expect(result.suggestions).toContain('インターネット接続を確認してください');
    });
  });
});