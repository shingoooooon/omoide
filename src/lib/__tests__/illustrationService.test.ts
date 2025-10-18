import { 
  generateIllustration, 
  generateMultipleIllustrations,
  createIllustrationPrompt,
  validateIllustrationRequest,
  IllustrationRequest 
} from '@/lib/illustrationService';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      images: {
        generate: jest.fn().mockResolvedValue({
          data: [{ url: 'https://example.com/generated-image.png' }]
        })
      }
    }))
  };
});

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  uploadImageFromUrl: jest.fn().mockResolvedValue('https://example.com/uploaded-image.png')
}));

describe('illustrationService', () => {
  describe('validateIllustrationRequest', () => {
    it('should validate correct illustration request', () => {
      const validRequest: IllustrationRequest = {
        prompt: 'A happy baby playing',
        pageNumber: 1,
        style: 'children-book',
        mood: 'happy'
      };

      expect(validateIllustrationRequest(validRequest)).toBe(true);
    });

    it('should reject request with empty prompt', () => {
      const invalidRequest: IllustrationRequest = {
        prompt: '',
        pageNumber: 1
      };

      expect(validateIllustrationRequest(invalidRequest)).toBe(false);
    });

    it('should reject request with invalid page number', () => {
      const invalidRequest: IllustrationRequest = {
        prompt: 'A happy baby',
        pageNumber: 0
      };

      expect(validateIllustrationRequest(invalidRequest)).toBe(false);
    });
  });

  describe('createIllustrationPrompt', () => {
    it('should create prompt from Japanese story text', () => {
      const storyText = '今日もにこにこ笑顔が素敵だね！';
      const prompt = createIllustrationPrompt(storyText);
      
      expect(prompt).toContain('baby');
      expect(prompt).toContain('smiling');
      expect(prompt).toContain('home');
    });

    it('should include context in prompt', () => {
      const storyText = 'お座りが上手になったね';
      const context = {
        childAge: 'toddler' as const,
        setting: 'park' as const,
        activity: 'sitting'
      };
      
      const prompt = createIllustrationPrompt(storyText, context);
      
      expect(prompt).toContain('toddler');
      expect(prompt).toContain('sitting');
      expect(prompt).toContain('park');
    });

    it('should handle growth-related text', () => {
      const storyText = 'だんだん大きくなって成長しているね';
      const prompt = createIllustrationPrompt(storyText);
      
      expect(prompt).toContain('growth and development');
    });

    it('should handle play-related text', () => {
      const storyText = 'おもちゃで楽しく遊んでいるね';
      const prompt = createIllustrationPrompt(storyText);
      
      expect(prompt).toContain('playing');
    });
  });

  describe('generateIllustration', () => {
    it('should generate illustration successfully', async () => {
      const request: IllustrationRequest = {
        prompt: 'A happy baby playing',
        pageNumber: 1,
        style: 'children-book',
        mood: 'happy'
      };

      const result = await generateIllustration(request);

      expect(result).toEqual({
        pageNumber: 1,
        imageUrl: 'https://example.com/uploaded-image.png',
        originalPrompt: 'A happy baby playing',
        generatedAt: expect.any(Date)
      });
    });

    it('should handle generation errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const OpenAI = require('openai').default;
      const mockOpenAI = new OpenAI();
      mockOpenAI.images.generate.mockRejectedValueOnce(new Error('API Error'));

      const request: IllustrationRequest = {
        prompt: 'A happy baby',
        pageNumber: 1
      };

      await expect(generateIllustration(request)).rejects.toThrow('ページ1の挿絵生成中にエラーが発生しました');
    });
  });

  describe('generateMultipleIllustrations', () => {
    it('should generate multiple illustrations', async () => {
      const requests: IllustrationRequest[] = [
        { prompt: 'A happy baby', pageNumber: 1 },
        { prompt: 'A smiling child', pageNumber: 2 }
      ];

      const results = await generateMultipleIllustrations(requests);

      expect(results).toHaveLength(2);
      expect(results[0].pageNumber).toBe(1);
      expect(results[1].pageNumber).toBe(2);
    });

    it('should handle partial failures gracefully', async () => {
      // Mock OpenAI to fail on second request
      const OpenAI = require('openai').default;
      const mockOpenAI = new OpenAI();
      mockOpenAI.images.generate
        .mockResolvedValueOnce({ data: [{ url: 'https://example.com/image1.png' }] })
        .mockRejectedValueOnce(new Error('API Error'));

      const requests: IllustrationRequest[] = [
        { prompt: 'A happy baby', pageNumber: 1 },
        { prompt: 'A smiling child', pageNumber: 2 }
      ];

      const results = await generateMultipleIllustrations(requests);

      expect(results).toHaveLength(2);
      expect(results[0].imageUrl).toBe('https://example.com/uploaded-image.png');
      expect(results[1].imageUrl).toBe('/placeholder-illustration.png');
    });
  });
});