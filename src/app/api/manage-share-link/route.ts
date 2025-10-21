import { NextRequest, NextResponse } from 'next/server';
import { 
  updateShareLinkStatus, 
  deleteShareLink, 
  getContentShareLinks 
} from '@/lib/services/shareLinkService';
import { updateGrowthRecordSharing } from '@/lib/services/growthRecordService';
import { updateStorybookSharing } from '@/lib/services/storybookService';

export async function PUT(request: NextRequest) {
  try {
    const { shareId, isActive } = await request.json();

    if (!shareId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Share ID and isActive status are required' },
        { status: 400 }
      );
    }

    await updateShareLinkStatus(shareId, isActive);

    return NextResponse.json({ 
      success: true, 
      message: `Share link ${isActive ? 'activated' : 'deactivated'}` 
    });

  } catch (error) {
    console.error('Error updating share link status:', error);
    return NextResponse.json(
      { error: 'Failed to update share link status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    await deleteShareLink(shareId);

    // If contentId and contentType are provided, update the content's sharing status
    if (contentId && contentType) {
      // Check if there are any other active share links for this content
      const remainingLinks = await getContentShareLinks(contentId, contentType as 'record' | 'storybook');
      const hasActiveLinks = remainingLinks.length > 0;

      if (!hasActiveLinks) {
        // No more active share links, update content sharing status
        if (contentType === 'record') {
          await updateGrowthRecordSharing(contentId, false);
        } else if (contentType === 'storybook') {
          await updateStorybookSharing(contentId, false);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Share link deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting share link:', error);
    return NextResponse.json(
      { error: 'Failed to delete share link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Content ID and content type are required' },
        { status: 400 }
      );
    }

    if (contentType !== 'record' && contentType !== 'storybook') {
      return NextResponse.json(
        { error: 'Content type must be either "record" or "storybook"' },
        { status: 400 }
      );
    }

    const shareLinks = await getContentShareLinks(contentId, contentType);

    return NextResponse.json({ shareLinks });

  } catch (error) {
    console.error('Error getting share links:', error);
    return NextResponse.json(
      { error: 'Failed to get share links' },
      { status: 500 }
    );
  }
}