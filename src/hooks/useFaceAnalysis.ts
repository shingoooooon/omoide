import { useState, useCallback } from 'react';
import { FaceAnalysisClient, ProcessFaceAnalysisResponse } from '@/lib/faceAnalysisClient';
import { FaceAnalysisEvaluation } from '@/lib/faceAnalysisService';

export interface FaceAnalysisState {
  isAnalyzing: boolean;
  results: ProcessFaceAnalysisResponse['results'];
  validCount: number;
  totalCount: number;
  error: string | null;
}

export interface FaceAnalysisHookReturn {
  state: FaceAnalysisState;
  analyzePhotos: (userId: string, photoUrls: string[]) => Promise<void>;
  analyzeSinglePhoto: (userId: string, photoUrl: string) => Promise<ProcessFaceAnalysisResponse['results'][0] | null>;
  checkPhotoSuitability: (userId: string, photoUrls: string[]) => Promise<{
    suitable: string[];
    unsuitable: string[];
    suggestions: string[];
  }>;
  getValidPhotos: () => string[];
  getInvalidPhotos: () => { url: string; reason: string; suggestions: string[] }[];
  reset: () => void;
}

/**
 * React hook for face analysis functionality
 */
export function useFaceAnalysis(): FaceAnalysisHookReturn {
  const [state, setState] = useState<FaceAnalysisState>({
    isAnalyzing: false,
    results: [],
    validCount: 0,
    totalCount: 0,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      results: [],
      validCount: 0,
      totalCount: 0,
      error: null,
    });
  }, []);

  const analyzePhotos = useCallback(async (userId: string, photoUrls: string[]) => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
    }));

    try {
      const response = await FaceAnalysisClient.processPhotos(userId, photoUrls);
      
      setState({
        isAnalyzing: false,
        results: response.results,
        validCount: response.validCount,
        totalCount: response.totalCount,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, []);

  const analyzeSinglePhoto = useCallback(async (
    userId: string, 
    photoUrl: string
  ): Promise<ProcessFaceAnalysisResponse['results'][0] | null> => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
    }));

    try {
      const result = await FaceAnalysisClient.processSinglePhoto(userId, photoUrl);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        results: [result],
        validCount: result.evaluation.isValid ? 1 : 0,
        totalCount: 1,
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
      return null;
    }
  }, []);

  const checkPhotoSuitability = useCallback(async (
    userId: string, 
    photoUrls: string[]
  ) => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
    }));

    try {
      const result = await FaceAnalysisClient.checkPhotoSuitability(userId, photoUrls);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
      
      return {
        suitable: [],
        unsuitable: photoUrls,
        suggestions: ['写真の解析に失敗しました。再試行してください。'],
      };
    }
  }, []);

  const getValidPhotos = useCallback((): string[] => {
    return state.results
      .filter(result => result.evaluation.isValid && !result.error)
      .map(result => result.imageUrl);
  }, [state.results]);

  const getInvalidPhotos = useCallback((): { url: string; reason: string; suggestions: string[] }[] => {
    return state.results
      .filter(result => !result.evaluation.isValid || result.error)
      .map(result => ({
        url: result.imageUrl,
        reason: result.error?.message || result.evaluation.reason || 'Unknown error',
        suggestions: [
          ...(result.evaluation.suggestions || []),
          ...(result.error?.suggestions || []),
        ],
      }));
  }, [state.results]);

  return {
    state,
    analyzePhotos,
    analyzeSinglePhoto,
    checkPhotoSuitability,
    getValidPhotos,
    getInvalidPhotos,
    reset,
  };
}

/**
 * Hook for simplified face detection validation
 */
export function useFaceDetectionValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    [url: string]: {
      isValid: boolean;
      confidence: number;
      reason: string;
      suggestions?: string[];
    };
  }>({});

  const validatePhoto = useCallback(async (userId: string, photoUrl: string) => {
    setIsValidating(true);
    
    try {
      const result = await FaceAnalysisClient.processSinglePhoto(userId, photoUrl);
      
      setValidationResults(prev => ({
        ...prev,
        [photoUrl]: {
          isValid: result.evaluation.isValid,
          confidence: result.evaluation.confidence,
          reason: result.evaluation.reason || 'No reason provided',
          suggestions: result.evaluation.suggestions,
        },
      }));

      return result.evaluation.isValid;
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        [photoUrl]: {
          isValid: false,
          confidence: 0,
          reason: error instanceof Error ? error.message : 'Validation failed',
          suggestions: ['写真を再度確認してください'],
        },
      }));
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const getValidationResult = useCallback((photoUrl: string) => {
    return validationResults[photoUrl] || null;
  }, [validationResults]);

  const clearValidationResults = useCallback(() => {
    setValidationResults({});
  }, []);

  return {
    isValidating,
    validatePhoto,
    getValidationResult,
    clearValidationResults,
    validationResults,
  };
}