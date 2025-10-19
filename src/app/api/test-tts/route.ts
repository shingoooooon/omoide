import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const requiredEnvVars = [
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_CLOUD_CLIENT_EMAIL', 
      'GOOGLE_CLOUD_PRIVATE_KEY',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
    ];
    
    const envStatus = requiredEnvVars.reduce((acc, varName) => {
      acc[varName] = process.env[varName] ? '✅ Set' : '❌ Missing';
      return acc;
    }, {} as Record<string, string>);

    // Test TTS client initialization
    let ttsStatus = '❌ Not tested';
    try {
      const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
      const client = new TextToSpeechClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
      });
      
      // Test with a simple list voices call
      await client.listVoices({ languageCode: 'ja-JP' });
      ttsStatus = '✅ Working';
    } catch (error) {
      ttsStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Test Firebase Admin
    let firebaseStatus = '❌ Not tested';
    try {
      const { adminStorage } = await import('@/lib/firebase-admin');
      const bucket = adminStorage.bucket();
      firebaseStatus = `✅ Bucket: ${bucket.name}`;
    } catch (error) {
      firebaseStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      status: 'TTS Service Test',
      environment: envStatus,
      ttsClient: ttsStatus,
      firebaseAdmin: firebaseStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}