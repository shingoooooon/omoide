import { 
  generateCommentsForPhotos, 
  updateComment, 
  removeComment,
  GrowthComment,
  Photo 
} from '../commentGenerationService';

// Fetch のモック
global.fetch = jest.fn();

describe('commentGenerationService', () => {
  const mockPhotos: Photo[] = [
    {
      id: 'photo-1',
      url: 'https://example.com/photo1.jpg',
      fileName: 'photo1.jpg',
      uploadedAt: new Date('2024-01-01'),
      faceDetected: true
    },
    {
      id: 'photo-2',
      url: 'https://example.com/photo2.jpg',
      fileName: 'photo2.jpg',
      uploadedAt: new Date('2024-01-02'),
      faceDetected: true
    }
  ];

  const mockAnalysisData = [
    { faceDetected: true, emotions: ['joy'] },
    { faceDetected: true, emotions: ['curiosity'] }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCommentsForPhotos', () => {
    it('成功時にコメントを生成する', async () => {
      const mockResponse = {
        success: true,
        comments: ['素敵な笑顔だね！', '好奇心いっぱいの表情が可愛いな']
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generateCommentsForPhotos(mockPhotos, mockAnalysisData);

      expect(result.success).toBe(true);
      expect(result.comments).toHaveLength(2);
      expect(result.comments[0].content).toBe('素敵な笑顔だね！');
      expect(result.comments[0].photoId).toBe('photo-1');
      expect(result.comments[0].isEdited).toBe(false);
    });

    it('APIエラー時にエラーを返す', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API エラー' })
      });

      const result = await generateCommentsForPhotos(mockPhotos, mockAnalysisData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API エラー');
      expect(result.comments).toHaveLength(0);
    });

    it('ネットワークエラー時にエラーを返す', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await generateCommentsForPhotos(mockPhotos, mockAnalysisData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ネットワークエラーが発生しました');
      expect(result.comments).toHaveLength(0);
    });
  });

  describe('updateComment', () => {
    const mockComments: GrowthComment[] = [
      {
        id: 'comment-1',
        photoId: 'photo-1',
        content: '元のコメント',
        generatedAt: new Date(),
        isEdited: false
      },
      {
        id: 'comment-2',
        photoId: 'photo-2',
        content: '別のコメント',
        generatedAt: new Date(),
        isEdited: false
      }
    ];

    it('指定されたコメントを更新する', () => {
      const result = updateComment(mockComments, 'comment-1', '更新されたコメント');

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('更新されたコメント');
      expect(result[0].isEdited).toBe(true);
      expect(result[1].content).toBe('別のコメント');
      expect(result[1].isEdited).toBe(false);
    });

    it('存在しないIDの場合は変更しない', () => {
      const result = updateComment(mockComments, 'nonexistent', '更新されたコメント');

      expect(result).toEqual(mockComments);
    });
  });

  describe('removeComment', () => {
    const mockComments: GrowthComment[] = [
      {
        id: 'comment-1',
        photoId: 'photo-1',
        content: 'コメント1',
        generatedAt: new Date(),
        isEdited: false
      },
      {
        id: 'comment-2',
        photoId: 'photo-2',
        content: 'コメント2',
        generatedAt: new Date(),
        isEdited: false
      }
    ];

    it('指定されたコメントを削除する', () => {
      const result = removeComment(mockComments, 'comment-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('comment-2');
    });

    it('存在しないIDの場合は変更しない', () => {
      const result = removeComment(mockComments, 'nonexistent');

      expect(result).toEqual(mockComments);
    });
  });
});