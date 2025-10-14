import { FaceAnalysisEvaluation } from './faceAnalysisService';

export interface ProcessFaceAnalysisRequest {
  userId: string;
  photoUrls: string[];
}

export interface ProcessFaceAnalysisResponse {
  success: boolean;
  message?: string;
  results: {
    imageUrl: string;
    evaluation: FaceAnalysisEvaluation;
    analysisId?: string;
    error?: {
      message: string;
      suggestions: string[];
      canRetry: boolean;
    };
  }[];
  validCount: number;
  totalCount: number;
}

/**
 * Client-side service for face analysis processing
 */
export class FaceAnalysisClient {
  private static readonly API_ENDPOINT = '/api/process-face-analysis';

  /**
   * Process photos for face analysis and save results
   * @param userId - User ID
   * @param photoUrls - Array of photo URLs to process
   * @returns Promise<ProcessFaceAnalysisResponse>
   */
  static async processPhotos(
    userId: string, 
    photoUrls: string[]
  ): Promise<ProcessFaceAnalysisResponse> {
    if (!userId) {
      throw new Error('User ID is required');
    }

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
          userId,
          photoUrls,
        } as ProcessFaceAnalysisRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: ProcessFaceAnalysisResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Face analysis processing failed');
      }

      return data;
    } catch (error) {
      console.error('Face analysis client error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Unknown error occurred during face analysis processing');
    }
  }

  /**
   * Process a single photo for face analysis
   * @param userId - User ID
   * @param photoUrl - URL of the photo to process
   * @returns Promise<ProcessFaceAnalysisResponse['results'][0]>
   */
  static async processSinglePhoto(
    userId: string, 
    photoUrl: string
  ): Promise<ProcessFaceAnalysisResponse['results'][0]> {
    const response = await this.processPhotos(userId, [photoUrl]);
    
    if (response.results.length === 0) {
      throw new Error('No analysis result returned');
    }

    return response.results[0];
  }

  /**
   * Get only valid face analysis results
   * @param userId - User ID
   * @param photoUrls - Array of photo URLs to process
   * @returns Promise<ProcessFaceAnalysisResponse['results']> - Only valid results
   */
  static async getValidFaceAnalyses(
    userId: string, 
    photoUrls: string[]
  ): Promise<ProcessFaceAnalysisResponse['results']> {
    const response = await this.processPhotos(userId, photoUrls);
    
    return response.results.filter(result => 
      result.evaluation.isValid && !result.error
    );
  }

  /**
   * Get analysis results with error handling information
   * @param userId - User ID
   * @param photoUrls - Array of photo URLs to process
   * @returns Promise<{valid: ProcessFaceAnalysisResponse['results'], invalid: ProcessFaceAnalysisResponse['results']}>
   */
  static async getAnalysisResultsWithErrors(
    userId: string, 
    photoUrls: string[]
  ): Promise<{
    valid: ProcessFaceAnalysisResponse['results'];
    invalid: ProcessFaceAnalysisResponse['results'];
    summary: {
      totalCount: number;
      validCount: number;
      invalidCount: number;
      retryableCount: number;
    };
  }> {
    const response = await this.processPhotos(userId, photoUrls);
    
    const valid = response.results.filter(result => 
      result.evaluation.isValid && !result.error
    );
    
    const invalid = response.results.filter(result => 
      !result.evaluation.isValid || result.error
    );

    const retryableCount = invalid.filter(result => 
      result.error?.canRetry
    ).length;

    return {
      valid,
      invalid,
      summary: {
        totalCount: response.totalCount,
        validCount: response.validCount,
        invalidCount: invalid.length,
        retryableCount,
      },
    };
  }

  /**
   * Check if photos are suitable for growth tracking
   * @param userId - User ID
   * @param photoUrls - Array of photo URLs to check
   * @returns Promise<{suitable: string[], unsuitable: string[], suggestions: string[]}>
   */
  static async checkPhotoSuitability(
    userId: string, 
    photoUrls: string[]
  ): Promise<{
    suitable: string[];
    unsuitable: string[];
    suggestions: string[];
  }> {
    try {
      const response = await this.processPhotos(userId, photoUrls);
      
      const suitable: string[] = [];
      const unsuitable: string[] = [];
      const allSuggestions = new Set<string>();

      response.results.forEach(result => {
        if (result.evaluation.isValid && result.evaluation.confidence > 0.7) {
          suitable.push(result.imageUrl);
        } else {
          unsuitable.push(result.imageUrl);
          
          // Collect suggestions
          if (result.evaluation.suggestions) {
            result.evaluation.suggestions.forEach(suggestion => 
              allSuggestions.add(suggestion)
            );
          }
          
          if (result.error?.suggestions) {
            result.error.suggestions.forEach(suggestion => 
              allSuggestions.add(suggestion)
            );
          }
        }
      });

      return {
        suitable,
        unsuitable,
        suggestions: Array.from(allSuggestions),
      };
    } catch (error) {
      console.error('Photo suitability check failed:', error);
      return {
        suitable: [],
        unsuitable: photoUrls,
        suggestions: [
          '写真の品質を確認してください',
          'インターネット接続を確認してください',
          'しばらく待ってから再試行してください',
        ],
      };
    }
  }
}