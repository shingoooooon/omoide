import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Vision API client
let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    // Check if we have the required environment variables
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Google Cloud credentials are not properly configured');
    }

    // Create credentials object
    const credentials = {
      type: 'service_account',
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
    };

    visionClient = new ImageAnnotatorClient({
      credentials,
      projectId,
    });
  }

  return visionClient;
}

export interface FaceDetectionResult {
  faceDetected: boolean;
  faceCount: number;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  emotions?: {
    joy: number;
    sorrow: number;
    anger: number;
    surprise: number;
  };
}

export interface VisionAnalysisResult {
  imageUrl: string;
  faceDetection: FaceDetectionResult;
  labels?: string[];
  error?: string;
}

/**
 * Detect faces in an image using Google Vision API
 * @param imageUrl - URL of the image to analyze
 * @returns Promise<FaceDetectionResult>
 */
export async function detectFaces(imageUrl: string): Promise<FaceDetectionResult> {
  try {
    const client = getVisionClient();
    
    // Perform face detection
    const [result] = await client.faceDetection({
      image: { source: { imageUri: imageUrl } },
    });

    const faces = result.faceAnnotations || [];
    
    if (faces.length === 0) {
      return {
        faceDetected: false,
        faceCount: 0,
        confidence: 0,
      };
    }

    // Get the first (most prominent) face
    const primaryFace = faces[0];
    const boundingPoly = primaryFace.boundingPoly;
    
    // Calculate bounding box if available
    let boundingBox;
    if (boundingPoly && boundingPoly.vertices && boundingPoly.vertices.length >= 4) {
      const vertices = boundingPoly.vertices;
      const minX = Math.min(...vertices.map(v => v.x || 0));
      const minY = Math.min(...vertices.map(v => v.y || 0));
      const maxX = Math.max(...vertices.map(v => v.x || 0));
      const maxY = Math.max(...vertices.map(v => v.y || 0));
      
      boundingBox = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }

    // Extract emotion data if available
    let emotions;
    if (primaryFace.joyLikelihood || primaryFace.sorrowLikelihood || 
        primaryFace.angerLikelihood || primaryFace.surpriseLikelihood) {
      emotions = {
        joy: getLikelihoodScore(primaryFace.joyLikelihood),
        sorrow: getLikelihoodScore(primaryFace.sorrowLikelihood),
        anger: getLikelihoodScore(primaryFace.angerLikelihood),
        surprise: getLikelihoodScore(primaryFace.surpriseLikelihood),
      };
    }

    // Calculate confidence based on detection confidence
    const confidence = primaryFace.detectionConfidence || 0.8;

    return {
      faceDetected: true,
      faceCount: faces.length,
      confidence,
      boundingBox,
      emotions,
    };
  } catch (error) {
    console.error('Face detection error:', error);
    throw new Error(`Face detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze multiple images for face detection
 * @param imageUrls - Array of image URLs to analyze
 * @returns Promise<VisionAnalysisResult[]>
 */
export async function analyzeImages(imageUrls: string[]): Promise<VisionAnalysisResult[]> {
  const results: VisionAnalysisResult[] = [];

  for (const imageUrl of imageUrls) {
    try {
      const faceDetection = await detectFaces(imageUrl);
      
      results.push({
        imageUrl,
        faceDetection,
      });
    } catch (error) {
      console.error(`Error analyzing image ${imageUrl}:`, error);
      results.push({
        imageUrl,
        faceDetection: {
          faceDetected: false,
          faceCount: 0,
          confidence: 0,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Convert Google Vision API likelihood enum to numeric score
 * @param likelihood - Likelihood enum from Vision API
 * @returns Numeric score between 0 and 1
 */
function getLikelihoodScore(likelihood: string | null | undefined): number {
  switch (likelihood) {
    case 'VERY_UNLIKELY':
      return 0.1;
    case 'UNLIKELY':
      return 0.3;
    case 'POSSIBLE':
      return 0.5;
    case 'LIKELY':
      return 0.7;
    case 'VERY_LIKELY':
      return 0.9;
    default:
      return 0;
  }
}

/**
 * Validate if an image contains a detectable face
 * @param imageUrl - URL of the image to validate
 * @returns Promise<boolean>
 */
export async function validateImageHasFace(imageUrl: string): Promise<boolean> {
  try {
    const result = await detectFaces(imageUrl);
    return result.faceDetected && result.confidence > 0.5;
  } catch (error) {
    console.error('Face validation error:', error);
    return false;
  }
}