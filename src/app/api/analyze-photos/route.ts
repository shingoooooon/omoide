import { NextRequest, NextResponse } from 'next/server';
import { analyzeImages, VisionAnalysisResult } from '@/lib/vision';

export interface AnalyzePhotosRequest {
  photoUrls: string[];
}

export interface AnalyzePhotosResponse {
  results: VisionAnalysisResult[];
  success: boolean;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzePhotosRequest = await request.json();
    
    // Validate request
    if (!body.photoUrls || !Array.isArray(body.photoUrls)) {
      return NextResponse.json(
        {
          success: false,
          message: 'photoUrls array is required',
          results: [],
        } as AnalyzePhotosResponse,
        { status: 400 }
      );
    }

    if (body.photoUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one photo URL is required',
          results: [],
        } as AnalyzePhotosResponse,
        { status: 400 }
      );
    }

    // Limit the number of photos to analyze at once
    if (body.photoUrls.length > 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum 10 photos can be analyzed at once',
          results: [],
        } as AnalyzePhotosResponse,
        { status: 400 }
      );
    }

    // Validate URLs
    for (const url of body.photoUrls) {
      if (!url || typeof url !== 'string') {
        return NextResponse.json(
          {
            success: false,
            message: 'All photo URLs must be valid strings',
            results: [],
          } as AnalyzePhotosResponse,
          { status: 400 }
        );
      }

      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid URL format: ${url}`,
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
    console.error('Photo analysis API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        results: [],
      } as AnalyzePhotosResponse,
      { status: 500 }
    );
  }
}