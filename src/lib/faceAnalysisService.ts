import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { VisionAnalysisResult, FaceDetectionResult } from './vision';

export interface FaceAnalysisEvaluation {
  isValid: boolean;
  confidence: number;
  reason?: string;
  suggestions?: string[];
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  imageUrl: string;
  analysisResult: VisionAnalysisResult;
  evaluation: FaceAnalysisEvaluation;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Evaluate face detection results to determine if they meet quality standards
 * @param faceDetection - Face detection result from Vision API
 * @returns FaceAnalysisEvaluation
 */
export function evaluateFaceDetection(faceDetection: FaceDetectionResult): FaceAnalysisEvaluation {
  const { faceDetected, faceCount, confidence, boundingBox } = faceDetection;

  // No face detected
  if (!faceDetected || faceCount === 0) {
    return {
      isValid: false,
      confidence: 0,
      reason: '顔が検出されませんでした',
      suggestions: [
        '明るい場所で撮影してください',
        '顔がはっきり見えるように撮影してください',
        '顔が画像の中央に来るように調整してください',
      ],
    };
  }

  // Low confidence detection
  if (confidence < 0.5) {
    return {
      isValid: false,
      confidence,
      reason: '顔の検出精度が低すぎます',
      suggestions: [
        '画像の解像度を上げてください',
        'ピントが合った写真を使用してください',
        '顔がより鮮明に写っている写真を選んでください',
      ],
    };
  }

  // Multiple faces detected (might be confusing for baby growth tracking)
  if (faceCount > 1) {
    return {
      isValid: true,
      confidence,
      reason: '複数の顔が検出されました',
      suggestions: [
        '赤ちゃんの顔だけが写っている写真の方が良い結果が得られます',
        '他の人が写っていない写真を使用することをお勧めします',
      ],
    };
  }

  // Check bounding box size (face should be reasonably sized in the image)
  if (boundingBox) {
    const faceArea = boundingBox.width * boundingBox.height;
    const imageArea = 1000000; // Assume standard image size for calculation
    const faceRatio = faceArea / imageArea;

    if (faceRatio < 0.01) {
      return {
        isValid: false,
        confidence,
        reason: '顔が小さすぎます',
        suggestions: [
          '顔がより大きく写っている写真を使用してください',
          'カメラを赤ちゃんに近づけて撮影してください',
        ],
      };
    }
  }

  // Good quality detection
  if (confidence >= 0.8) {
    return {
      isValid: true,
      confidence,
      reason: '高品質な顔検出結果です',
    };
  }

  // Acceptable quality detection
  return {
    isValid: true,
    confidence,
    reason: '顔検出が成功しました',
  };
}

/**
 * Process and evaluate multiple vision analysis results
 * @param results - Array of vision analysis results
 * @returns Array of evaluations with suggestions
 */
export function processAnalysisResults(results: VisionAnalysisResult[]): {
  result: VisionAnalysisResult;
  evaluation: FaceAnalysisEvaluation;
}[] {
  return results.map(result => ({
    result,
    evaluation: evaluateFaceDetection(result.faceDetection),
  }));
}

/**
 * Filter results to only include valid face detections
 * @param results - Array of vision analysis results
 * @returns Array of valid results
 */
export function filterValidFaceDetections(results: VisionAnalysisResult[]): VisionAnalysisResult[] {
  return results.filter(result => {
    const evaluation = evaluateFaceDetection(result.faceDetection);
    return evaluation.isValid;
  });
}

/**
 * Save analysis result to Firestore
 * @param userId - User ID
 * @param imageUrl - URL of the analyzed image
 * @param analysisResult - Vision analysis result
 * @param evaluation - Face analysis evaluation
 * @returns Promise<string> - Document ID
 */
export async function saveAnalysisToFirestore(
  userId: string,
  imageUrl: string,
  analysisResult: VisionAnalysisResult,
  evaluation: FaceAnalysisEvaluation
): Promise<string> {
  try {
    const analysisCollection = collection(db, 'users', userId, 'analyses');
    const docRef = doc(analysisCollection);
    
    const analysisRecord: Omit<AnalysisRecord, 'id'> = {
      userId,
      imageUrl,
      analysisResult,
      evaluation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(docRef, {
      ...analysisRecord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis to Firestore:', error);
    throw new Error(`Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save multiple analysis results to Firestore
 * @param userId - User ID
 * @param results - Array of analysis results with evaluations
 * @returns Promise<string[]> - Array of document IDs
 */
export async function saveMultipleAnalysesToFirestore(
  userId: string,
  results: { result: VisionAnalysisResult; evaluation: FaceAnalysisEvaluation }[]
): Promise<string[]> {
  const documentIds: string[] = [];

  for (const { result, evaluation } of results) {
    try {
      const docId = await saveAnalysisToFirestore(
        userId,
        result.imageUrl,
        result,
        evaluation
      );
      documentIds.push(docId);
    } catch (error) {
      console.error(`Failed to save analysis for ${result.imageUrl}:`, error);
      // Continue with other results even if one fails
    }
  }

  return documentIds;
}

/**
 * Retrieve analysis result from Firestore
 * @param userId - User ID
 * @param analysisId - Analysis document ID
 * @returns Promise<AnalysisRecord | null>
 */
export async function getAnalysisFromFirestore(
  userId: string,
  analysisId: string
): Promise<AnalysisRecord | null> {
  try {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AnalysisRecord;
  } catch (error) {
    console.error('Error retrieving analysis from Firestore:', error);
    throw new Error(`Failed to retrieve analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update analysis evaluation in Firestore
 * @param userId - User ID
 * @param analysisId - Analysis document ID
 * @param evaluation - Updated evaluation
 * @returns Promise<void>
 */
export async function updateAnalysisEvaluation(
  userId: string,
  analysisId: string,
  evaluation: FaceAnalysisEvaluation
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    
    await updateDoc(docRef, {
      evaluation,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating analysis evaluation:', error);
    throw new Error(`Failed to update analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle face detection failure with user-friendly error messages
 * @param error - Error from face detection
 * @param imageUrl - URL of the image that failed
 * @returns User-friendly error information
 */
export function handleFaceDetectionError(error: Error, imageUrl: string): {
  message: string;
  suggestions: string[];
  canRetry: boolean;
} {
  const errorMessage = error.message.toLowerCase();

  // Network or API errors
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return {
      message: 'インターネット接続に問題があります',
      suggestions: [
        'インターネット接続を確認してください',
        'しばらく待ってから再試行してください',
      ],
      canRetry: true,
    };
  }

  // API quota or rate limit errors
  if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
    return {
      message: 'サービスの利用制限に達しました',
      suggestions: [
        'しばらく時間をおいてから再試行してください',
        '一度に処理する写真の数を減らしてください',
      ],
      canRetry: true,
    };
  }

  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('credential')) {
    return {
      message: 'サービスの設定に問題があります',
      suggestions: [
        'アプリを再起動してください',
        '問題が続く場合はサポートにお問い合わせください',
      ],
      canRetry: false,
    };
  }

  // Image format or processing errors
  if (errorMessage.includes('image') || errorMessage.includes('format')) {
    return {
      message: '画像の処理に失敗しました',
      suggestions: [
        '別の画像形式（JPEG、PNG）を試してください',
        '画像サイズが大きすぎる場合は小さくしてください',
        '画像が破損していないか確認してください',
      ],
      canRetry: true,
    };
  }

  // Generic error
  return {
    message: '画像の解析に失敗しました',
    suggestions: [
      '別の写真を試してください',
      'しばらく待ってから再試行してください',
      '問題が続く場合はサポートにお問い合わせください',
    ],
    canRetry: true,
  };
}