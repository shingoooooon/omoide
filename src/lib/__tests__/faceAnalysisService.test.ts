import {
  evaluateFaceDetection,
  processAnalysisResults,
  filterValidFaceDetections,
  handleFaceDetectionError,
} from '../faceAnalysisService';
import { FaceDetectionResult, VisionAnalysisResult } from '../vision';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
}));

describe('FaceAnalysisService', () => {
  describe('evaluateFaceDetection', () => {
    it('should return invalid for no face detected', () => {
      const faceDetection: FaceDetectionResult = {
        faceDetected: false,
        faceCount: 0,
        confidence: 0,
      };

      const evaluation = evaluateFaceDetection(faceDetection);

      expect(evaluation.isValid).toBe(false);
      expect(evaluation.confidence).toBe(0);
      expect(evaluation.reason).toBe('顔が検出されませんでした');
      expect(evaluation.suggestions).toContain('明るい場所で撮影してください');
    });

    it('should return invalid for low confidence detection', () => {
      const faceDetection: FaceDetectionResult = {
        faceDetected: true,
        faceCount: 1,
        confidence: 0.3,
      };

      const evaluation = evaluateFaceDetection(faceDetection);

      expect(evaluation.isValid).toBe(false);
      expect(evaluation.confidence).toBe(0.3);
      expect(evaluation.reason).toBe('顔の検出精度が低すぎます');
      expect(evaluation.suggestions).toContain('画像の解像度を上げてください');
    });

    it('should return valid with warning for multiple faces', () => {
      const faceDetection: FaceDetectionResult = {
        faceDetected: true,
        faceCount: 2,
        confidence: 0.8,
      };

      const evaluation = evaluateFaceDetection(faceDetection);

      expect(evaluation.isValid).toBe(true);
      expect(evaluation.confidence).toBe(0.8);
      expect(evaluation.reason).toBe('複数の顔が検出されました');
      expect(evaluation.suggestions).toContain('赤ちゃんの顔だけが写っている写真の方が良い結果が得られます');
    });

    it('should return invalid for face too small', () => {
      const faceDetection: FaceDetectionResult = {
        faceDetected: true,
        faceCount: 1,
        confidence: 0.8,
        boundingBox: {
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        },
      };

      const evaluation = evaluateFaceDetection(faceDetection);

      expect(evaluation.isValid).toBe(false);
      expect(evaluation.reason).toBe('顔が小さすぎます');
      expect(evaluation.suggestions).toContain('顔がより大きく写っている写真を使用してください');
    });

    it('should return valid for high quality detection', () => {
      const faceDetection: FaceDetectionResult = {
        faceDetected: true,
        faceCount: 1,
        confidence: 0.9,
        boundingBox: {
          x: 100,
          y: 100,
          width: 200,
          height: 200,
        },
      };

      const evaluation = evaluateFaceDetection(faceDetection);

      expect(evaluation.isValid).toBe(true);
      expect(evaluation.confidence).toBe(0.9);
      expect(evaluation.reason).toBe('高品質な顔検出結果です');
    });

    it('should return valid for acceptable quality detection', () => {
      const faceDetection: FaceDetectionResult = {
        faceDetected: true,
        faceCount: 1,
        confidence: 0.7,
      };

      const evaluation = evaluateFaceDetection(faceDetection);

      expect(evaluation.isValid).toBe(true);
      expect(evaluation.confidence).toBe(0.7);
      expect(evaluation.reason).toBe('顔検出が成功しました');
    });
  });

  describe('processAnalysisResults', () => {
    it('should process multiple analysis results', () => {
      const results: VisionAnalysisResult[] = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.9,
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

      const processed = processAnalysisResults(results);

      expect(processed).toHaveLength(2);
      expect(processed[0].evaluation.isValid).toBe(true);
      expect(processed[1].evaluation.isValid).toBe(false);
    });
  });

  describe('filterValidFaceDetections', () => {
    it('should filter only valid face detections', () => {
      const results: VisionAnalysisResult[] = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.9,
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
            confidence: 0.8,
          },
        },
      ];

      const validResults = filterValidFaceDetections(results);

      expect(validResults).toHaveLength(2);
      expect(validResults[0].imageUrl).toBe('https://example.com/photo1.jpg');
      expect(validResults[1].imageUrl).toBe('https://example.com/photo3.jpg');
    });

    it('should return empty array when no valid detections', () => {
      const results: VisionAnalysisResult[] = [
        {
          imageUrl: 'https://example.com/photo1.jpg',
          faceDetection: {
            faceDetected: false,
            faceCount: 0,
            confidence: 0,
          },
        },
        {
          imageUrl: 'https://example.com/photo2.jpg',
          faceDetection: {
            faceDetected: true,
            faceCount: 1,
            confidence: 0.3, // Low confidence
          },
        },
      ];

      const validResults = filterValidFaceDetections(results);

      expect(validResults).toHaveLength(0);
    });
  });

  describe('handleFaceDetectionError', () => {
    it('should handle network errors', () => {
      const error = new Error('Network timeout');
      const errorInfo = handleFaceDetectionError(error, 'https://example.com/photo.jpg');

      expect(errorInfo.message).toBe('インターネット接続に問題があります');
      expect(errorInfo.canRetry).toBe(true);
      expect(errorInfo.suggestions).toContain('インターネット接続を確認してください');
    });

    it('should handle quota errors', () => {
      const error = new Error('Quota exceeded');
      const errorInfo = handleFaceDetectionError(error, 'https://example.com/photo.jpg');

      expect(errorInfo.message).toBe('サービスの利用制限に達しました');
      expect(errorInfo.canRetry).toBe(true);
      expect(errorInfo.suggestions).toContain('しばらく時間をおいてから再試行してください');
    });

    it('should handle authentication errors', () => {
      const error = new Error('Authentication failed');
      const errorInfo = handleFaceDetectionError(error, 'https://example.com/photo.jpg');

      expect(errorInfo.message).toBe('サービスの設定に問題があります');
      expect(errorInfo.canRetry).toBe(false);
      expect(errorInfo.suggestions).toContain('アプリを再起動してください');
    });

    it('should handle image format errors', () => {
      const error = new Error('Invalid image format');
      const errorInfo = handleFaceDetectionError(error, 'https://example.com/photo.jpg');

      expect(errorInfo.message).toBe('画像の処理に失敗しました');
      expect(errorInfo.canRetry).toBe(true);
      expect(errorInfo.suggestions).toContain('別の画像形式（JPEG、PNG）を試してください');
    });

    it('should handle generic errors', () => {
      const error = new Error('Unknown error');
      const errorInfo = handleFaceDetectionError(error, 'https://example.com/photo.jpg');

      expect(errorInfo.message).toBe('画像の解析に失敗しました');
      expect(errorInfo.canRetry).toBe(true);
      expect(errorInfo.suggestions).toContain('別の写真を試してください');
    });
  });
});