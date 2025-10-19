import { NextRequest, NextResponse } from 'next/server';
import { uploadImageFromUrl } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // Test uploading an image to Firebase Storage
    const testFileName = `test/test-upload-${Date.now()}.png`;
    const uploadedUrl = await uploadImageFromUrl(imageUrl, testFileName);

    return NextResponse.json({
      success: true,
      message: 'Storage upload test successful',
      originalUrl: imageUrl,
      uploadedUrl: uploadedUrl,
      fileName: testFileName
    });

  } catch (error: any) {
    console.error('Storage test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Storage test failed',
      details: {
        code: error.code,
        message: error.message
      }
    }, { status: 500 });
  }
}