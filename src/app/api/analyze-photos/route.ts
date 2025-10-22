import { NextRequest, NextResponse } from 'next/server';
import { analyzeImages, VisionAnalysisResult } from '@/lib/vision';
import { OmoideError, ErrorType, createError, logError } from '@/lib/errors';

export interface AnalyzePhotosRequest {
  photoUrls: string[];
}

export interface AnalyzePhotosResponse {
  results: VisionAnalysisResult[];
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzePhotosRequest = await request.json();
    
    // Validate request
    if (!body.photoUrls || !Array.isArray(body.photoUrls)) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        'photoUrls array is required'
      );
      logError(error, 'analyze-photos API');
      
      return NextResponse.json(
        {
          success: false,
          error: error.userMessage,
          message: error.message,
          results: [],
        } as AnalyzePhotosResponse,
        { status: 400 }
      );
    }

    if (body.photoUrls.length === 0) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        'At least one photo URL is required'
      );
      logError(error, 'analyze-photos API');
      
      return NextResponse.json(
        {
          success: false,
          error: error.userMessage,
          message: error.message,
          results: [],
        } as AnalyzePhotosResponse,
        { status: 400 }
      );
    }

    // Limit the number of photos to analyze at once
    if (body.photoUrls.length > 10) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        'Maximum 10 photos can be analyzed at once'
      );
      logError(error, 'analyze-photos API');
      
      return NextResponse.json(
        {
          success: false,
          error: error.userMessage,
          message: error.message,
          results: [],
        } as AnalyzePhotosResponse,
        { status: 400 }
      );
    }

    // Validate URLs
    for (const url of body.photoUrls) {
      if (!url || typeof url !== 'string') {
        const error = createError(
          ErrorType.VALIDATION_ERROR,
          'All photo URLs must be valid strings'
        );
        logError(error, 'analyze-photos API');
        
        return NextResponse.json(
          {
            success: false,
            error: error.userMessage,
            message: error.message,
            results: [],
          } as AnalyzePhotosResponse,
          { status: 400 }
        );
      }

      try {
        new URL(url);
      } catch {
        const error = createError(
          ErrorType.VALIDATION_ERROR,
          `Invalid URL format: ${url}`
        );
        logError(error, 'analyze-photos API');
        
        return NextResponse.json(
          {
            success: false,
            error: error.userMessage,
            message: error.message,
            results: [],
          } as AnalyzePhotosResponse,
          { status: 400 }
        );
      }
    }

    // Analyze the images
    const results = await analyzeImages(body.photoUrls);

    return NextResponse.json({
      success: true,
      results,
    } as AnalyzePhotosResponse);

  } catch (error) {
    let omoideError: OmoideError;
    
    if (error instanceof OmoideError) {
      omoideError = error;
    } else {
      omoideError = createError(ErrorType.VISION_API_ERROR, error);
    }
    
    logError(omoideError, 'analyze-photos API');
    
    return NextResponse.json(
      {
        success: false,
        error: omoideError.userMessage,
        message: omoideError.message,
        results: [],
      } as AnalyzePhotosResponse,
      { status: 500 }
    );
  }
}