import { FaceDetectionService } from '../faceDetectionService';
import { VisionAnalysisResult } from '../vision';

// Mock fetch globally
global.fetch = jest.fn();

describe('FaceDetectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzePhotos', () => {
    it('should successfully analyze photos', async () => {
      const mockResponse: VisionAnalysisResult[] = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.9,
            boundingBox: { x: 100, y: 100, width: 200, height: 200 },
          },
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          faceDetection: {
            faceDetected: false,
            faceCount: 0,
            confidence: 0,
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: mockResponse,
        }),
      });

      const photoUrls = ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'];
      const results = await FaceDetectionService.analyzePhotos(photoUrls);

      expect(fetch).toHaveBeenCalledWith('/api/analyze-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrls }),
      });

      expect(results).toEqual(mockResponse);
    });

    it('should throw error for empty photo URLs array', async () => {
      await expect(FaceDetectionService.analyzePhotos([])).rejects.toThrow(
        'At least one photo URL is required'
      );
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
        FaceDetectionService.analyzePhotos(['https://example.com/photo.jpg'])
      ).rejects.toThrow('Invalid request');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        FaceDetectionService.analyzePhotos(['https://example.com/photo.jpg'])
      ).rejects.toThrow('Network error');
    });
  });

  describe('analyzeSinglePhoto', () => {
    it('should analyze a single photo', async () => {
      const mockResult: VisionAnalysisResult = {
        imageUrl: 'https://example.com/photo.jpg',
        faceDetection: {
          faceDetected: true,
          faceCount: 1,
          confidence: 0.8,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [mockResult],
        }),
      });

      const result = await FaceDetectionService.analyzeSinglePhoto('https://example.com/photo.jpg');

      expect(result).toEqual(mockResult);
    });

    it('should throw error when no results returned', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [],
        }),
      });

      await expect(
        FaceDetectionService.analyzeSinglePhoto('https://example.com/photo.jpg')
      ).rejects.toThrow('No analysis result returned');
    });
  });

  describe('hasDetectableFace', () => {
    it('should return true for photo with detectable face', async () => {
      const mockResult: VisionAnalysisResult = {
        imageUrl: 'https://example.com/photo.jpg',
        faceDetection: {
          faceDetected: true,
          faceCount: 1,
          confidence: 0.8,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [mockResult],
        }),
      });

      const hasface = await FaceDetectionService.hasDetectableFace('https://example.com/photo.jpg');

      expect(hasface).toBe(true);
    });

    it('should return false for photo without detectable face', async () => {
      const mockResult: VisionAnalysisResult = {
        imageUrl: 'https://example.com/photo.jpg',
        faceDetection: {
          faceDetected: false,
          faceCount: 0,
          confidence: 0,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [mockResult],
        }),
      });

      const hasface = await FaceDetectionService.hasDetectableFace('https://example.com/photo.jpg');

      expect(hasface).toBe(false);
    });

    it('should return false for low confidence detection', async () => {
      const mockResult: VisionAnalysisResult = {
        imageUrl: 'https://example.com/photo.jpg',
        faceDetection: {
          faceDetected: true,
          faceCount: 1,
          confidence: 0.3, // Low confidence
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [mockResult],
        }),
      });

      const hasface = await FaceDetectionService.hasDetectableFace('https://example.com/photo.jpg');

      expect(hasface).toBe(false);
    });

    it('should return false when API call fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const hasface = await FaceDetectionService.hasDetectableFace('https://example.com/photo.jpg');

      expect(hasface).toBe(false);
    });
  });

  describe('filterPhotosWithFaces', () => {
    it('should filter photos with detectable faces', async () => {
      const mockResults: VisionAnalysisResult[] = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.8,
          },
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          faceDetection: {
            faceDetected: false,
            faceCount: 0,
            confidence: 0,
          },
        },
        {
          imageUrl: 'https://example.com/photo3.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.9,
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: mockResults,
        }),
      });

      const photoUrls = [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
      ];

      const filteredUrls = await FaceDetectionService.filterPhotosWithFaces(photoUrls);

      expect(filteredUrls).toEqual([
        'https://example.com/photo1.jpg',
        'https://example.com/photo3.jpg',
      ]);
    });

    it('should return empty array when API call fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const filteredUrls = await FaceDetectionService.filterPhotosWithFaces([
        'https://example.com/photo.jpg',
      ]);

      expect(filteredUrls).toEqual([]);
    });
  });

  describe('getPhotosWithFaceDetails', () => {
    it('should return detailed analysis for photos with faces', async () => {
      const mockResults: VisionAnalysisResult[] = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.8,
            emotions: { joy: 0.7, sorrow: 0.1, anger: 0.1, surprise: 0.2 },
          },
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          faceDetection: {
            faceDetected: false,
            faceCount: 0,
            confidence: 0,
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: mockResults,
        }),
      });

      const photoUrls = ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'];
      const detailedResults = await FaceDetectionService.getPhotosWithFaceDetails(photoUrls);

      expect(detailedResults).toEqual([mockResults[0]]);
    });

    it('should return empty array when API call fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const detailedResults = await FaceDetectionService.getPhotosWithFaceDetails([
        'https://example.com/photo.jpg',
      ]);

      expect(detailedResults).toEqual([]);
    });
  });
});