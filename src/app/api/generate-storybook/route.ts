import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyGrowthRecords } from '@/lib/services/growthRecordService';
import { generateStoryFromRecords, generateStorybookIllustrations } from '@/lib/storybookGenerator';
import { createStorybook } from '@/lib/services/storybookService';
import { checkMonthlyStorybookStatus } from '@/lib/storybookUtils';
import { GrowthRecord, Storybook } from '@/types/models';

export async function POST(request: NextRequest) {
  try {
    const { userId, month } = await request.json();

    if (!userId || !month) {
      return NextResponse.json(
        { error: 'ユーザーIDと月が必要です' },
        { status: 400 }
      );
    }

    // Check if storybook can be created for this month
    const status = await checkMonthlyStorybookStatus(userId, month);

    if (status.hasStorybook) {
      return NextResponse.json(
        { 
          error: 'この月の絵本は既に作成されています',
          details: '既存の絵本を確認するか、別の月の絵本を作成してください。'
        },
        { status: 409 }
      );
    }

    if (!status.canCreateStorybook) {
      return NextResponse.json(
        { 
          error: status.message || '絵本を作成できません',
          details: status.message
        },
        { status: 400 }
      );
    }

    // Parse month for record retrieval
    const [year, monthNum] = month.split('-').map(Number);
    
    // Get monthly growth records
    const records = await getMonthlyGrowthRecords(userId, year, monthNum);

    // Generate story from records
    const storyData = await generateStoryFromRecords(records);

    // Generate illustrations for the story
    const pagesWithIllustrations = await generateStorybookIllustrations(storyData.pages);

    // Create storybook object
    const storybook: Omit<Storybook, 'id'> = {
      userId,
      title: storyData.title,
      month,
      pages: pagesWithIllustrations,
      createdAt: new Date(),
      isShared: false
    };

    // Save storybook to Firestore
    const storybookId = await createStorybook(storybook);

    return NextResponse.json({
      success: true,
      storybookId,
      storybook: { ...storybook, id: storybookId }
    });

  } catch (error) {
    console.error('Storybook generation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: '絵本の生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}