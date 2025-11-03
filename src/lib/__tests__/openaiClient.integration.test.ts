// Integration tests for OpenAI Client
// These tests mock OpenAI API responses to test integration behavior

import { generateStoryFromRecords, generateIllustration } from '../openaiClient';

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

describe('OpenAI Client Integration Tests', () => {
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const OpenAI = require('openai').default;
    mockOpenAI = new OpenAI();
  });

  describe('Story Generation Integration', () => {
    it('should generate story from growth records', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Once upon a time, there was a happy baby who loved to smile...'
            }
          }
        ]
      });

      const mockRecords = [
        {
          id: 'record1',
          photos: [{ url: 'photo1.jpg' }],
          comments: [{ content: 'Beautiful smile!' }],
          createdAt: new Date('2024-01-15')
        }
      ];

      const result = await generateStoryFromRecords(mockRecords, '2024-01');

      expect(result).toContain('Once upon a time');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system'
            }),
            expect.objectContaining({
              role: 'user'
            })
          ])
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('OpenAI API rate limit exceeded')
      );

      const mockRecords = [
        {
          id: 'record1',
          photos: [{ url: 'photo1.jpg' }],
          comments: [{ content: 'Beautiful smile!' }],
          createdAt: new Date('2024-01-15')
        }
      ];

      await expect(generateStoryFromRecords(mockRecords, '2024-01'))
        .rejects.toThrow('OpenAI API rate limit exceeded');
    });

    it('should handle empty records gracefully', async () => {
      const result = await generateStoryFromRecords([], '2024-01');
      
      expect(result).toBe('');
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });
  });

  describe('Illustration Generation Integration', () => {
    it('should generate illustration from prompt', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: [
          {
            url: 'https://example.com/generated-image.png'
          }
        ]
      });

      const result = await generateIllustration('A happy baby playing with toys');

      expect(result).toBe('https://example.com/generated-image.png');
      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'dall-e-3',
          prompt: expect.stringContaining('A happy baby playing with toys'),
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      );
    });

    it('should handle illustration generation errors', async () => {
      mockOpenAI.images.generate.mockRejectedValue(
        new Error('Content policy violation')
      );

      await expect(generateIllustration('inappropriate content'))
        .rejects.toThrow('Content policy violation');
    });

    it('should handle empty response from DALL-E', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: []
      });

      await expect(generateIllustration('A happy baby'))
        .rejects.toThrow('No image generated');
    });
  });

  describe('API Configuration Integration', () => {
    it('should use correct model configurations', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Test story' } }]
      });

      const mockRecords = [
        {
          id: 'record1',
          photos: [{ url: 'photo1.jpg' }],
          comments: [{ content: 'Test comment' }],
          createdAt: new Date()
        }
      ];

      await generateStoryFromRecords(mockRecords, '2024-01');

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          max_tokens: expect.any(Number),
          temperature: expect.any(Number)
        })
      );
    });

    it('should include proper system prompts', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Test story' } }]
      });

      const mockRecords = [
        {
          id: 'record1',
          photos: [{ url: 'photo1.jpg' }],
          comments: [{ content: 'Test comment' }],
          createdAt: new Date()
        }
      ];

      await generateStoryFromRecords(mockRecords, '2024-01');

      const call = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const systemMessage = call.messages.find((msg: any) => msg.role === 'system');
      
      expect(systemMessage).toBeDefined();
      expect(systemMessage.content).toContain('絵本');
      expect(systemMessage.content).toContain('成長記録');
    });
  });
});