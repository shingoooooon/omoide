import { VisionAnalysisResult } from './vision';

export interface AnalyzePhotosRequest {
  photoUrls: string[];
}

export interface AnalyzePhotosResponse {
  results: VisionAnalysisResult[];
  success: boolean;
  message?: string;
}

/**
 * Client-side service for face detection API calls
 */
export class FaceDetectionService {
  private static readonly API_ENDPOINT = '/api/analyze-photos';

  /**
   * Analyze photos for face detection
   * @param photoUrls - Array of photo URLs to analyze
   * @returns Promise<VisionAnalysisResult[]>
   */
  static async analyzePhotos(photoUrls: string[]): Promise<VisionAnalysisResult[]> {
    if (!photoUrls || photoUrls.length === 0) {
      throw new Error('At least one photo URL is required');
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrls,
        } as AnalyzePhotosRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: AnalyzePhotosResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Photo analysis failed');
      }

      return data.results;
    } catch (error) {
      console.error('Face detection service error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Unknown error occurred during photo analysis');
    }
  }

  /**
   * Analyze a single photo for face detection
   * @param photoUrl - URL of the photo to analyze
   * @returns Promise<VisionAnalysisResult>
   */
  static async analyzeSinglePhoto(photoUrl: string): Promise<VisionAnalysisResult> {
    const results = await this.analyzePhotos([photoUrl]);
    
    if (results.length === 0) {
      throw new Error('No analysis result returned');
    }

    return results[0];
  }

  /**
   * Check if a photo contains a detectable face
   * @param photoUrl - URL of the photo to check
   * @returns Promise<boolean>
   */
  static async hasDetectableFace(photoUrl: string): Promise<boolean> {
    try {
      const result = await this.analyzeSinglePhoto(photoUrl);
      return result.faceDetection.faceDetected && result.faceDetection.confidence > 0.5;
    } catch (error) {
      console.error('Face detection check failed:', error);
      return false;
    }
  }

  /**
   * Filter photos that contain detectable faces
   * @param photoUrls - Array of photo URLs to filter
   * @returns Promise<string[]> - URLs of photos with detectable faces
   */
  static async filterPhotosWithFaces(photoUrls: string[]): Promise<string[]> {
    try {
      const results = await this.analyzePhotos(photoUrls);
      
      return results
        .filter(result => 
          result.faceDetection.faceDetected && 
          result.faceDetection.confidence > 0.5 &&
          !result.error
        )
        .map(result => result.imageUrl);
    } catch (error) {
      console.error('Photo filtering failed:', error);
      return [];
    }
  }

  /**
   * Get detailed analysis for photos with faces
   * @param photoUrls - Array of photo URLs to analyze
   * @returns Promise<VisionAnalysisResult[]> - Only results with detected faces
   */
  static async getPhotosWithFaceDetails(photoUrls: string[]): Promise<VisionAnalysisResult[]> {
    try {
      const results = await this.analyzePhotos(photoUrls);
      
      return results.filter(result => 
        result.faceDetection.faceDetected && 
        result.faceDetection.confidence > 0.5 &&
        !result.error
      );
    } catch (error) {
      console.error('Detailed face analysis failed:', error);
      return [];
    }
  }
}