import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { adminStorage } from './firebase-admin';

// Initialize Google Cloud TTS client lazily
let ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    console.log('🔧 Initializing Google Cloud TTS client...');

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Google Cloud credentials. Please check your environment variables.');
    }

    ttsClient = new TextToSpeechClient({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    console.log('✅ TTS client initialized');
  }

  return ttsClient;
}

export interface TTSOptions {
  text: string;
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'NEUTRAL' | 'FEMALE' | 'MALE';
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
}

export interface TTSResult {
  audioUrl: string;
  audioBuffer: Buffer;
  fileName: string;
}

/**
 * Generate speech audio from text using Google Cloud TTS
 */
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    languageCode = 'ja-JP',
    voiceName = 'ja-JP-Neural2-B', // Female Japanese voice
    ssmlGender = 'FEMALE',
    audioEncoding = 'MP3'
  } = options;

  // Development fallback: Generate mock audio if TTS is not available
  if (process.env.NODE_ENV === 'development') {
    let ttsAudioBuffer: Buffer | null = null;

    try {
      console.log('🎤 TTS Request:', {
        textLength: text.length,
        languageCode,
        voiceName,
        ssmlGender
      });

      // Construct the request
      const request = {
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
          ssmlGender,
        },
        audioConfig: {
          audioEncoding,
          speakingRate: 0.9, // Slightly slower for children's content
          pitch: 2.0, // Higher pitch for friendly tone
        },
      };

      console.log('📡 Calling Google Cloud TTS...');

      // Get TTS client and perform the text-to-speech request
      const client = getTTSClient();
      const [response] = await client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      console.log('✅ TTS response received, audio size:', response.audioContent.length);

      // Convert audio content to Buffer and store it
      ttsAudioBuffer = Buffer.from(response.audioContent as Uint8Array);

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `audio/tts_${timestamp}.mp3`;

      console.log('☁️ Uploading to Firebase Storage:', fileName);

      // Try to upload to Firebase Storage
      const audioUrl = await uploadAudioToStorage(ttsAudioBuffer, fileName);

      console.log('✅ Upload complete:', audioUrl);

      return {
        audioUrl,
        audioBuffer: ttsAudioBuffer,
        fileName,
      };
    } catch (error) {
      console.error('❌ TTS/Storage error:', error);

      // If we have TTS audio but storage failed, use the TTS audio directly
      if (ttsAudioBuffer) {
        console.log('🎤 Using real TTS audio as data URL (storage failed)');

        const timestamp = Date.now();
        const fileName = `audio/tts_${timestamp}.mp3`;

        // Return TTS audio as data URL
        const base64Audio = ttsAudioBuffer.toString('base64');
        const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

        console.log('✅ Using real TTS audio as data URL');

        return {
          audioUrl: dataUrl,
          audioBuffer: ttsAudioBuffer,
          fileName,
        };
      }

      // Fallback to mock audio only if TTS completely fails
      console.log('🔄 Using mock audio as last resort');
      const mockAudioBuffer = generateMockAudio(text);
      const timestamp = Date.now();
      const fileName = `audio/mock_tts_${timestamp}.mp3`;

      // Return as data URL for development (WAV format)
      const base64Audio = mockAudioBuffer.toString('base64');
      const dataUrl = `data:audio/wav;base64,${base64Audio}`;

      return {
        audioUrl: dataUrl,
        audioBuffer: mockAudioBuffer,
        fileName,
      };
    }
  } else {
    // Production: Throw error if TTS fails
    try {
      console.log('🎤 TTS Request:', {
        textLength: text.length,
        languageCode,
        voiceName,
        ssmlGender
      });

      const request = {
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
          ssmlGender,
        },
        audioConfig: {
          audioEncoding,
          speakingRate: 0.9,
          pitch: 2.0,
        },
      };

      const client = getTTSClient();
      const [response] = await client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
      const timestamp = Date.now();
      const fileName = `audio/tts_${timestamp}.mp3`;
      const audioUrl = await uploadAudioToStorage(audioBuffer, fileName);

      return {
        audioUrl,
        audioBuffer,
        fileName,
      };
    } catch (error) {
      console.error('❌ Error generating speech:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Upload audio buffer to Firebase Storage using Admin SDK
 */
async function uploadAudioToStorage(audioBuffer: Buffer, fileName: string): Promise<string> {
  try {
    const bucket = adminStorage.bucket();
    const file = bucket.file(fileName);

    console.log('📁 Uploading file:', fileName, 'to bucket:', bucket.name);

    // Upload the audio file with proper options
    await file.save(audioBuffer, {
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
      public: true, // Make file public during upload
      validation: false, // Skip validation for faster upload
    });

    console.log('✅ File uploaded successfully');

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    console.log('🔗 Public URL:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading audio to storage:', error);

    // If it's a permission error, provide helpful guidance and fallback
    if (error && typeof error === 'object' && 'code' in error && error.code === 403) {
      console.error('💡 Permission fix needed: The service account needs Storage Object Admin role');
      console.error('💡 Go to: https://console.cloud.google.com/iam-admin/iam?project=maximal-ceiling-474722-j0');
      console.error('💡 Add "Storage Object Admin" role to: omoide@maximal-ceiling-474722-j0.iam.gserviceaccount.com');

      // For development, return a data URL as fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using development fallback: returning data URL');
        const base64Audio = audioBuffer.toString('base64');
        return `data:audio/mpeg;base64,${base64Audio}`;
      }
    }

    throw new Error(`Failed to upload audio: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}

/**
 * Generate speech for storybook page
 */
export async function generateStorybookPageAudio(
  text: string,
  pageId: string,
  storybookId: string
): Promise<string> {
  try {
    const result = await generateSpeech({
      text,
      languageCode: 'ja-JP',
      voiceName: 'ja-JP-Neural2-B',
      ssmlGender: 'FEMALE',
    });

    // Log for debugging purposes
    console.log(`Generated audio for storybook ${storybookId}, page ${pageId}`);

    return result.audioUrl;
  } catch (error) {
    console.error(`Error generating audio for page ${pageId}:`, error);
    throw error;
  }
}

/**
 * Generate a mock audio file for development using WAV format
 */
function generateMockAudio(text: string): Buffer {
  // Generate a simple WAV file with multiple tones to simulate speech
  const sampleRate = 22050; // Lower sample rate for smaller files
  const duration = Math.max(2, Math.min(10, Math.floor(text.length / 15))); // 2-10 seconds based on text length
  const numSamples = sampleRate * duration;

  // Create WAV header
  const wavHeader = Buffer.alloc(44);

  // RIFF header
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + numSamples * 2, 4); // File size - 8
  wavHeader.write('WAVE', 8);

  // Format chunk
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Format chunk size
  wavHeader.writeUInt16LE(1, 20); // Audio format (PCM)
  wavHeader.writeUInt16LE(1, 22); // Number of channels (mono)
  wavHeader.writeUInt32LE(sampleRate, 24); // Sample rate
  wavHeader.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  wavHeader.writeUInt16LE(2, 32); // Block align
  wavHeader.writeUInt16LE(16, 34); // Bits per sample

  // Data chunk
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(numSamples * 2, 40); // Data size

  // Generate audio samples (varying frequency to simulate speech)
  const audioData = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    // Create a varying frequency that sounds more like speech
    const baseFreq = 200 + Math.sin(time * 2) * 50; // 150-250 Hz base
    const modulation = Math.sin(time * 8) * 0.3; // Add some modulation
    const sample = Math.sin(2 * Math.PI * baseFreq * time) * (0.15 + modulation * 0.05);

    // Add some envelope to make it sound more natural
    const envelope = Math.min(1, time * 4) * Math.min(1, (duration - time) * 4);
    const finalSample = sample * envelope;

    const intSample = Math.round(finalSample * 16383); // Lower volume
    audioData.writeInt16LE(intSample, i * 2);
  }

  const wavFile = Buffer.concat([wavHeader, audioData]);

  console.log(`🎭 Generated mock WAV audio: ${wavFile.length} bytes, ${duration}s for "${text.substring(0, 30)}..."`);

  return wavFile;
}

/**
 * Get available Japanese voices
 */
export async function getAvailableVoices() {
  try {
    const client = getTTSClient();
    const [response] = await client.listVoices({
      languageCode: 'ja-JP',
    });

    return response.voices?.map(voice => ({
      name: voice.name,
      ssmlGender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
    })) || [];
  } catch (error) {
    console.error('Error fetching available voices:', error);
    return [];
  }
}