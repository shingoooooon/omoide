import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/textToSpeechService';

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Audio generation request received');
    
    const body = await request.json();
    const { text, pageId, storybookId, options = {} } = body;

    console.log('📝 Request data:', { 
      textLength: text?.length, 
      pageId, 
      storybookId, 
      options 
    });

    if (!text) {
      console.error('❌ No text provided');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    const requiredEnvVars = [
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_CLOUD_CLIENT_EMAIL', 
      'GOOGLE_CLOUD_PRIVATE_KEY',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars);
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: `Missing environment variables: ${missingVars.join(', ')}`
        },
        { status: 500 }
      );
    }

    console.log('🔧 Environment variables check passed');

    // Generate speech audio
    console.log('🎤 Starting TTS generation...');
    const result = await generateSpeech({
      text,
      languageCode: options.languageCode || 'ja-JP',
      voiceName: options.voiceName || 'ja-JP-Neural2-B',
      ssmlGender: options.ssmlGender || 'FEMALE',
      audioEncoding: 'MP3',
    });

    console.log('✅ Audio generation successful:', result.fileName);

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      fileName: result.fileName,
      pageId,
      storybookId,
    });
  } catch (error) {
    console.error('❌ Error in generate-audio API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}