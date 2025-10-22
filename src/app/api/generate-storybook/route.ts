import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyGrowthRecords } from '@/lib/services/growthRecordService';
import { generateStoryFromRecords, generateStorybookIllustrations } from '@/lib/storybookGenerator';
import { createStorybook } from '@/lib/services/storybookService';
import { checkMonthlyStorybookStatus } from '@/lib/storybookUtils';
import { GrowthRecord, Storybook } from '@/types/models';
import { OmoideError, ErrorType, createError, logError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { userId, month } = await request.json();

    if (!userId || !month) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        'ユーザーIDと月が必要です'
      );
      logError(error, 'generate-storybook API');
      
      return NextResponse.json(
        { 
          success: false,
          error: error.userMessage 
        },
        { status: 400 }
      );
    }

    // Check if storybook can be created for this month
    const status = await checkMonthlyStorybookStatus(userId, month);

    if (status.hasStorybook) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        'この月の絵本は既に作成されています',
        { details: '既存の絵本を確認するか、別の月の絵本を作成してください。' }
      );
      logError(error, 'generate-storybook API');
      
      return NextResponse.json(
        { 
          success: false,
          error: error.userMessage,
          details: error.details?.details
        },
        { status: 409 }
      );
    }

    if (!status.canCreateStorybook) {
      const error = createError(
        ErrorType.VALIDATION_ERROR,
        status.message || '絵本を作成できません',
        { status }
      );
      logError(error, 'generate-storybook API');
      
      return NextResponse.json(
        { 
          success: false,
          error: error.userMessage,
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
    let omoideError: OmoideError;
    
    if (error instanceof OmoideError) {
      omoideError = error;
    } else {
      // Categorize the error based on the operation that failed
      if (error instanceof Error) {
        if (error.message.includes('story') || error.message.includes('generate')) {
          omoideError = createError(ErrorType.STORYBOOK_GENERATION_FAILED, error);
        } else if (error.message.includes('illustration') || error.message.includes('image')) {
          omoideError = createError(ErrorType.ILLUSTRATION_GENERATION_FAILED, error);
        } else if (error.message.includes('firestore') || error.message.includes('save')) {
          omoideError = createError(ErrorType.FIRESTORE_ERROR, error);
        } else {
          omoideError = createError(ErrorType.STORYBOOK_GENERATION_FAILED, error);
        }
      } else {
        omoideError = createError(ErrorType.STORYBOOK_GENERATION_FAILED, error);
      }
    }
    
    logError(omoideError, 'generate-storybook API');
    
    return NextResponse.json(
      { 
        success: false,
        error: omoideError.userMessage 
      },
      { status: 500 }
    );
  }
}