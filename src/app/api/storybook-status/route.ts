import { NextRequest, NextResponse } from 'next/server';
import { checkMonthlyStorybookStatus } from '@/lib/storybookUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');

    if (!userId || !month) {
      return NextResponse.json(
        { error: 'ユーザーIDと月が必要です' },
        { status: 400 }
      );
    }

    const status = await checkMonthlyStorybookStatus(userId, month);

    return NextResponse.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Storybook status check error:', error);
    
    return NextResponse.json(
      { error: 'ステータスの確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}