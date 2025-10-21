import { NextRequest, NextResponse } from 'next/server';
import { createShareLink } from '@/lib/services/shareLinkService';
import { getGrowthRecord, updateGrowthRecordSharing } from '@/lib/services/growthRecordService';
import { getStorybook, updateStorybookSharing } from '@/lib/services/storybookService';

export async function POST(request: NextRequest) {
  try {
    const { contentId, contentType, userId, expiresAt } = await request.json();

    // Validate required fields
    if (!contentId || !contentType || !userId) {
      return NextResponse.json(
        { error: 'Content ID, content type, and user ID are required' },
        { status: 400 }
      );
    }

    // Validate content type
    if (contentType !== 'record' && contentType !== 'storybook') {
      return NextResponse.json(
        { error: 'Content type must be either "record" or "storybook"' },
        { status: 400 }
      );
    }

    // Verify that the content exists and belongs to the user
    let contentExists = false;
    try {
      if (contentType === 'record') {
        const record = await getGrowthRecord(contentId);
        contentExists = record !== null && record.userId === userId;
      } else {
        const storybook = await getStorybook(contentId);
        contentExists = storybook !== null && storybook.userId === userId;
      }
    } catch (error) {
      contentExists = false;
    }

    if (!contentExists) {
      return NextResponse.json(
        { error: 'Content not found or access denied' },
        { status: 404 }
      );
    }

    // Parse expiration date if provided
    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiration date format' },
          { status: 400 }
        );
      }
      
      // Check if expiration date is in the future
      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Create the share link
    const shareId = await createShareLink(
      contentId,
      contentType,
      userId,
      expirationDate
    );

    // Update the content's sharing status
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${shareId}`;
    
    if (contentType === 'record') {
      await updateGrowthRecordSharing(contentId, true, shareUrl);
    } else {
      await updateStorybookSharing(contentId, true, shareUrl);
    }

    return NextResponse.json({
      shareId,
      shareUrl,
      expiresAt: expirationDate?.toISOString()
    });

  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}