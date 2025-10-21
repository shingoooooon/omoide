import { NextRequest, NextResponse } from 'next/server';
import { validateShareLink } from '@/lib/services/shareLinkService';
import { getSharedGrowthRecord } from '@/lib/services/growthRecordService';
import { getSharedStorybook } from '@/lib/services/storybookService';

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // Validate the share link
    const validation = await validateShareLink(shareId);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid share link',
          reason: validation.reason 
        },
        { status: 404 }
      );
    }

    const shareLink = validation.shareLink!;

    // Fetch the shared content based on type
    let content = null;
    
    try {
      if (shareLink.contentType === 'record') {
        content = await getSharedGrowthRecord(shareLink.contentId);
      } else if (shareLink.contentType === 'storybook') {
        content = await getSharedStorybook(shareLink.contentId);
      }
    } catch (error) {
      console.error('Error fetching shared content:', error);
      return NextResponse.json(
        { 
          error: 'Content not found',
          reason: 'The shared content may have been deleted or is no longer available'
        },
        { status: 404 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { 
          error: 'Content not found',
          reason: 'The shared content may have been deleted or is no longer available'
        },
        { status: 404 }
      );
    }

    // Return the content with share metadata
    return NextResponse.json({
      shareLink: {
        id: shareLink.id,
        contentType: shareLink.contentType,
        createdAt: shareLink.createdAt,
        expiresAt: shareLink.expiresAt
      },
      content
    });

  } catch (error) {
    console.error('Error fetching shared content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared content' },
      { status: 500 }
    );
  }
}