import { NextRequest, NextResponse } from 'next/server';
import { analyzeImages } from '@/lib/vision';
import { 
  processAnalysisResults, 
  saveMultipleAnalysesToFirestore,
  handleFaceDetectionError,
  FaceAnalysisEvaluation 
} from '@/lib/faceAnalysisService';

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

export async function POST(request: NextRequest) {
  try {
    const body: ProcessFaceAnalysisRequest = await request.json();
    
    // Validate request
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
          results: [],
          validCount: 0,
          totalCount: 0,
        } as ProcessFaceAnalysisResponse,
        { status: 400 }
      );
    }

    if (!body.photoUrls || !Array.isArray(body.photoUrls)) {
      return NextResponse.json(
        {
          success: false,
          message: 'photoUrls array is required',
          results: [],
          validCount: 0,
          totalCount: 0,
        } as ProcessFaceAnalysisResponse,
        { status: 400 }
      );
    }

    if (body.photoUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one photo URL is required',
          results: [],
          validCount: 0,
          totalCount: 0,
        } as ProcessFaceAnalysisResponse,
        { status: 400 }
      );
    }

    // Limit the number of photos to process at once
    if (body.photoUrls.length > 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum 10 photos can be processed at once',
          results: [],
          validCount: 0,
          totalCount: 0,
        } as ProcessFaceAnalysisResponse,
        { status: 400 }
      );
    }

    const results: ProcessFaceAnalysisResponse['results'] = [];
    let validCount = 0;

    // Process each photo URL
    for (const photoUrl of body.photoUrls) {
      try {
        // Analyze the image
        const analysisResults = await analyzeImages([photoUrl]);
        
        if (analysisResults.length === 0) {
          results.push({
            imageUrl: photoUrl,
            evaluation: {
              isValid: false,
              confidence: 0,
              reason: '画像の解析に失敗しました',
              suggestions: ['別の画像を試してください'],
            },
            error: {
              message: '画像の解析に失敗しました',
              suggestions: ['別の画像を試してください'],
              canRetry: true,
            },
          });
          continue;
        }

        const analysisResult = analysisResults[0];
        
        // Check if there was an error in the analysis
        if (analysisResult.error) {
          const errorInfo = handleFaceDetectionError(
            new Error(analysisResult.error), 
            photoUrl
          );
          
          results.push({
            imageUrl: photoUrl,
            evaluation: {
              isValid: false,
              confidence: 0,
              reason: analysisResult.error,
            },
            error: errorInfo,
          });
          continue;
        }

        // Process and evaluate the analysis result
        const processedResults = processAnalysisResults([analysisResult]);
        const { result, evaluation } = processedResults[0];

        // Save to Firestore if valid
        let analysisId: string | undefined;
        if (evaluation.isValid) {
          try {
            const savedIds = await saveMultipleAnalysesToFirestore(body.userId, [
              { result, evaluation }
            ]);
            analysisId = savedIds[0];
            validCount++;
          } catch (firestoreError) {
            console.error('Failed to save to Firestore:', firestoreError);
            // Continue without failing the entire request
          }
        }

        results.push({
          imageUrl: photoUrl,
          evaluation,
          analysisId,
        });

      } catch (error) {
        console.error(`Error processing photo ${photoUrl}:`, error);
        
        const errorInfo = handleFaceDetectionError(
          error instanceof Error ? error : new Error('Unknown error'),
          photoUrl
        );

        results.push({
          imageUrl: photoUrl,
          evaluation: {
            isValid: false,
            confidence: 0,
            reason: 'Processing failed',
          },
          error: errorInfo,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      validCount,
      totalCount: body.photoUrls.length,
    } as ProcessFaceAnalysisResponse);

  } catch (error) {
    console.error('Face analysis processing API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        results: [],
        validCount: 0,
        totalCount: 0,
      } as ProcessFaceAnalysisResponse,
      { status: 500 }
    );
  }
}