import { generateStoryFromRecords, validateStoryData, generateStorybookTitle } from '@/lib/storybookGenerator';
import { GrowthRecord } from '@/types/models';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      },
      images: {
        generate: jest.fn()
      }
    }))
  };
});

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  uploadImageFromUrl: jest.fn().mockResolvedValue('https://example.com/uploaded-image.png')
}));

describe('storybookGenerator', () => {
  const mockRecords: GrowthRecord[] = [
    {
      id: '1',
      userId: 'user1',
      photos: [
        {
          id: 'photo1',
          url: 'https://example.com/photo1.jpg',
          fileName: 'photo1.jpg',
          uploadedAt: new Date('2024-01-15'),
          faceDetected: true
        }
      ],
      comments: [
        {
          id: 'comment1',
          photoId: 'photo1',
          content: '今日もにこにこ笑顔が素敵だね！',
          generatedAt: new Date('2024-01-15'),
          isEdited: false
        }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isShared: false
    },
    {
      id: '2',
      userId: 'user1',
      photos: [
        {
          id: 'photo2',
          url: 'https://example.com/photo2.jpg',
          fileName: 'photo2.jpg',
          uploadedAt: new Date('2024-01-20'),
          faceDetected: true
        }
      ],
      comments: [
        {
          id: 'comment2',
          photoId: 'photo2',
          content: 'だんだんお座りが上手になってきたね',
          generatedAt: new Date('2024-01-20'),
          isEdited: false
        }
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      isShared: false
    }
  ];

  describe('generateStorybookTitle', () => {
    it('should generate correct title for given month', () => {
      const title = generateStorybookTitle('2024-01', 5);
      expect(title).toBe('2024年1月の成長物語');
    });

    it('should handle different months correctly', () => {
      expect(generateStorybookTitle('2024-12', 3)).toBe('2024年12月の成長物語');
      expect(generateStorybookTitle('2023-06', 1)).toBe('2023年6月の成長物語');
    });
  });

  describe('validateStoryData', () => {
    it('should validate correct story data structure', () => {
      const validStoryData = {
        title: 'Test Story',
        pages: [
          {
            pageNumber: 1,
            text: 'Page 1 text',
            illustrationPrompt: 'A happy baby'
          },
          {
            pageNumber: 2,
            text: 'Page 2 text',
            illustrationPrompt: 'A smiling child'
          }
        ]
      };

      expect(validateStoryData(validStoryData)).toBe(true);
    });

    it('should reject invalid story data structure', () => {
      const invalidStoryData = {
        title: 'Test Story',
        pages: [
          {
            pageNumber: 1,
            text: 'Page 1 text'
            // Missing illustrationPrompt
          }
        ]
      };

      expect(validateStoryData(invalidStoryData)).toBe(false);
    });

    it('should reject story data without title', () => {
      const invalidStoryData = {
        pages: [
          {
            pageNumber: 1,
            text: 'Page 1 text',
            illustrationPrompt: 'A happy baby'
          }
        ]
      };

      expect(validateStoryData(invalidStoryData)).toBe(false);
    });

    it('should reject story data without pages', () => {
      const invalidStoryData = {
        title: 'Test Story'
      };

      expect(validateStoryData(invalidStoryData)).toBe(false);
    });
  });

  describe('generateStoryFromRecords', () => {
    it('should throw error when no OpenAI API key is provided', async () => {
      // Remove the API key for this test
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      await expect(generateStoryFromRecords(mockRecords)).rejects.toThrow();

      // Restore the API key
      process.env.OPENAI_API_KEY = originalApiKey;
    });

    it('should handle empty records array', async () => {
      await expect(generateStoryFromRecords([])).rejects.toThrow('物語の生成中にエラーが発生しました');
    });
  });
});