import { POST } from '../generate-comments/route';
import { NextRequest } from 'next/server';

// Mock the comment generation service
jest.mock('@/lib/commentGenerationService', () => ({
  generateGrowthComments: jest.fn()
}));

// Mock Firebase admin
jest.mock('@/lib/firebase-admin', () => ({
  verifyIdToken: jest.fn()
}));

describe('/api/generate-comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates comments successfully', async () => {
    const { generateGrowthComments } = require('@/lib/commentGenerationService');
    const { verifyIdToken } = require('@/lib/firebase-admin');

    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });
    generateGrowthComments.mockResolvedValue([
      {
        id: 'comment1',
        photoId: 'photo1',
        content: '素敵な笑顔ですね！',
        generatedAt: new Date(),
        isEdited: false
      }
    ]);

    const request = new NextRequest('http://localhost:3000/api/generate-comments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photos: [
          {
            id: 'photo1',
            url: 'https://example.com/photo1.jpg',
            fileName: 'photo1.jpg',
            uploadedAt: new Date().toISOString(),
            faceDetected: true
          }
        ],
        analysisData: [
          { faces: [{ confidence: 0.9 }] }
        ]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0].content).toBe('素敵な笑顔ですね！');
  });

  it('handles missing authorization', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photos: [],
        analysisData: []
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

    const request = new NextRequest('http://localhost:3000/api/generate-comments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing photos and analysisData
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('写真データが必要です');
  });

  it('handles comment generation errors', async () => {
    const { generateGrowthComments } = require('@/lib/commentGenerationService');
    const { verifyIdToken } = require('@/lib/firebase-admin');

    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });
    generateGrowthComments.mockRejectedValue(new Error('Generation failed'));

    const request = new NextRequest('http://localhost:3000/api/generate-comments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photos: [
          {
            id: 'photo1',
            url: 'https://example.com/photo1.jpg',
            fileName: 'photo1.jpg',
            uploadedAt: new Date().toISOString(),
            faceDetected: true
          }
        ],
        analysisData: [
          { faces: [{ confidence: 0.9 }] }
        ]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('コメントの生成に失敗しました');
  });

  it('handles empty photos array', async () => {
    const { verifyIdToken } = require('@/lib/firebase-admin');
    verifyIdToken.mockResolvedValue({ uid: 'test-user-id' });

    const request = new NextRequest('http://localhost:3000/api/generate-comments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photos: [],
        analysisData: []
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('写真データが必要です');
  });
});