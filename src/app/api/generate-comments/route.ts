import { NextRequest, NextResponse } from 'next/server';
import { generateMultipleGrowthComments } from '@/lib/openaiClient';
import { generateMultipleFreeComments } from '@/lib/freeCommentGenerator';
import { OmoideError, ErrorType, createError, logError } from '@/lib/errors';

export interface GenerateCommentsRequest {
  analysisDataArray: any[];
}

export interface GenerateCommentsResponse {
  comments: string[];
  success: boolean;
  error?: string;
  source?: string;
  note?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCommentsRequest = await request.json();
    const { analysisDataArray } = body;

    // 入力データの検証
    if (!analysisDataArray || !Array.isArray(analysisDataArray)) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        '解析データが正しく提供されていません'
      );
      logError(error, 'generate-comments API');
      
      return NextResponse.json(
        { 
          success: false, 
          error: error.userMessage,
          comments: []
        },
        { status: 400 }
      );
    }

    if (analysisDataArray.length === 0) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        '解析データが空です'
      );
      logError(error, 'generate-comments API');
      
      return NextResponse.json(
        { 
          success: false, 
          error: error.userMessage,
          comments: []
        },
        { status: 400 }
      );
    }

    // OpenAI APIキーの確認
    console.log('API Key check:', {
      exists: !!process.env.OPENAI_API_KEY,
      isDummy: process.env.OPENAI_API_KEY === 'sk-dummy_openai_api_key_for_development',
      prefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...'
    });
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-dummy_openai_api_key_for_development') {
      console.warn('OpenAI API key is not configured or is using dummy value');
      // 開発環境用のダミーコメントを返す
      const dummyComments = analysisDataArray.map((_, index) => 
        `今日も元気いっぱいの笑顔が素敵だね！（ダミーコメント${index + 1}）`
      );
      
      return NextResponse.json({
        success: true,
        comments: dummyComments,
        source: 'dummy',
        note: '開発環境のため、ダミーコメントを使用しています'
      });
    }

    // AIコメント生成を試行、失敗時は無料版にフォールバック
    try {
      const comments = await generateMultipleGrowthComments(analysisDataArray);
      return NextResponse.json({
        success: true,
        comments,
        source: 'openai'
      });
    } catch (openaiError) {
      console.warn('OpenAI API failed, falling back to free comments:', openaiError);
      
      const fallbackError = createError(
        ErrorType.OPENAI_API_ERROR,
        openaiError,
        { fallbackUsed: true }
      );
      logError(fallbackError, 'generate-comments API - fallback');
      
      // 無料版のコメント生成にフォールバック
      try {
        const freeComments = generateMultipleFreeComments(analysisDataArray);
        return NextResponse.json({
          success: true,
          comments: freeComments,
          source: 'free',
          note: 'OpenAI APIが利用できないため、無料版のコメント生成を使用しました'
        });
      } catch (fallbackError) {
        const error = createError(
          ErrorType.COMMENT_GENERATION_FAILED,
          fallbackError
        );
        logError(error, 'generate-comments API - fallback failed');
        
        return NextResponse.json(
          {
            success: false,
            error: error.userMessage,
            comments: []
          },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    let omoideError: OmoideError;
    
    if (error instanceof OmoideError) {
      omoideError = error;
    } else {
      omoideError = createError(ErrorType.COMMENT_GENERATION_FAILED, error);
    }
    
    logError(omoideError, 'generate-comments API');
    
    return NextResponse.json(
      {
        success: false,
        error: omoideError.userMessage,
        comments: []
      },
      { status: 500 }
    );
  }
}