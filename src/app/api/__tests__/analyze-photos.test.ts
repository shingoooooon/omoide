import { POST } from '../analyze-photos/route';
import { NextRequest } from 'next/server';

// Mock the face analysis service
jest.mock('@/lib/faceAnalysisService', () => ({
  analyzeFaces: jest.fn()
}));

// Mock Firebase admin
jest.mock('@/lib/firebase-admin', () => ({
  verifyIdToken: jest.fn()
}));

describe('/api/analyze-photos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('analyzes photos successfully', async () => {
    const { analyzeFaces } = require('@/lib/faceAnalysisService');
    const { verifyIdToken } = require('@/lib/firebase-admin');

    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });
    analyzeFaces.mockResolvedValue({
      faceDetected: true,
      analysisData: { faces: [{ confidence: 0.9 }] }
    });

    const request = new NextRequest('http://localhost:3000/api/analyze-photos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoUrls: ['https://example.com/photo1.jpg']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].faceDetected).toBe(true);
  });

  it('handles missing authorization', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze-photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoUrls: ['https://example.com/photo1.jpg']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('認証が必要です');
  });

  it('handles invalid request body', async () => {
    const { verifyIdToken } = require('@/lib/firebase-admin');
    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });

    const request = new NextRequest('http://localhost:3000/api/analyze-photos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing photoUrls
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('写真URLが必要です');
  });

  it('handles analysis errors', async () => {
    const { analyzeFaces } = require('@/lib/faceAnalysisService');
    const { verifyIdToken } = require('@/lib/firebase-admin');

    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });
    analyzeFaces.mockRejectedValue(new Error('Analysis failed'));

    const request = new NextRequest('http://localhost:3000/api/analyze-photos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoUrls: ['https://example.com/photo1.jpg']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('写真の解析に失敗しました');
  });

  it('handles multiple photos', async () => {
    const { analyzeFaces } = require('@/lib/faceAnalysisService');
    const { verifyIdToken } = require('@/lib/firebase-admin');

    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });
    analyzeFaces
      .mockResolvedValueOnce({ faceDetected: true, analysisData: {} })
      .mockResolvedValueOnce({ faceDetected: false, analysisData: {} });

    const request = new NextRequest('http://localhost:3000/api/analyze-photos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].faceDetected).toBe(true);
    expect(data.results[1].faceDetected).toBe(false);
  });
});