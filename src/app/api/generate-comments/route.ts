import { NextRequest, NextResponse } from 'next/server';
import { generateMultipleGrowthComments } from '@/lib/openaiClient';
import { generateMultipleFreeComments } from '@/lib/freeCommentGenerator';

export interface GenerateCommentsRequest {
  analysisDataArray: any[];
}

export interface GenerateCommentsResponse {
  comments: string[];
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCommentsRequest = await request.json();
    const { analysisDataArray } = body;

    // 入力データの検証
    if (!analysisDataArray || !Array.isArray(analysisDataArray)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '解析データが正しく提供されていません',
          comments: []
        },
        { status: 400 }
      );
    }

    if (analysisDataArray.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '解析データが空です',
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
        comments: dummyComments
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
      
      // 無料版のコメント生成にフォールバック
      const freeComments = generateMultipleFreeComments(analysisDataArray);
      return NextResponse.json({
        success: true,
        comments: freeComments,
        source: 'free',
        note: 'OpenAI APIが利用できないため、無料版のコメント生成を使用しました'
      });
    }

  } catch (error) {
    console.error('コメント生成API エラー:', error);
    console.error('エラーの詳細:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'コメント生成中に予期しないエラーが発生しました',
        comments: []
      },
      { status: 500 }
    );
  }
}