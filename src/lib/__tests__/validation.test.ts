// Unit tests for validation functions

import {
  validateUser,
  validatePhoto,
  validateGrowthComment,
  validateGrowthRecord,
  validateStorybookPage,
  validateStorybook,
  validateShareLink,
  validateImageFile,
  validateMonth,
  ValidationError
} from '../validation';
import { User, Photo, GrowthComment, GrowthRecord, StorybookPage, Storybook, ShareLink } from '@/types/models';

describe('Validation Functions', () => {
  describe('validateUser', () => {
    const validUser: User = {
      id: 'user123',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    it('should pass validation for valid user', () => {
      expect(() => validateUser(validUser)).not.toThrow();
    });

    it('should throw error for missing id', () => {
      const invalidUser = { ...validUser, id: '' };
      expect(() => validateUser(invalidUser)).toThrow(ValidationError);
    });

    it('should throw error for invalid email', () => {
      const invalidUser = { ...validUser, email: 'invalid-email' };
      expect(() => validateUser(invalidUser)).toThrow(ValidationError);
    });

    it('should throw error for empty display name', () => {
      const invalidUser = { ...validUser, displayName: '' };
      expect(() => validateUser(invalidUser)).toThrow(ValidationError);
    });

    it('should throw error for invalid photo URL', () => {
      const invalidUser = { ...validUser, photoURL: 'invalid-url' };
      expect(() => validateUser(invalidUser)).toThrow(ValidationError);
    });
  });

  describe('validatePhoto', () => {
    const validPhoto: Photo = {
      id: 'photo123',
      url: 'https://example.com/photo.jpg',
      fileName: 'photo.jpg',
      uploadedAt: new Date(),
      faceDetected: true
    };

    it('should pass validation for valid photo', () => {
      expect(() => validatePhoto(validPhoto)).not.toThrow();
    });

    it('should throw error for invalid URL', () => {
      const invalidPhoto = { ...validPhoto, url: 'invalid-url' };
      expect(() => validatePhoto(invalidPhoto)).toThrow(ValidationError);
    });

    it('should throw error for missing face detection boolean', () => {
      const invalidPhoto = { ...validPhoto, faceDetected: undefined as any };
      expect(() => validatePhoto(invalidPhoto)).toThrow(ValidationError);
    });
  });

  describe('validateGrowthComment', () => {
    const validComment: GrowthComment = {
      id: 'comment123',
      photoId: 'photo123',
      content: 'This is a growth comment',
      generatedAt: new Date(),
      isEdited: false
    };

    it('should pass validation for valid comment', () => {
      expect(() => validateGrowthComment(validComment)).not.toThrow();
    });

    it('should throw error for empty content', () => {
      const invalidComment = { ...validComment, content: '' };
      expect(() => validateGrowthComment(invalidComment)).toThrow(ValidationError);
    });

    it('should throw error for content too long', () => {
      const invalidComment = { ...validComment, content: 'a'.repeat(1001) };
      expect(() => validateGrowthComment(invalidComment)).toThrow(ValidationError);
    });
  });

  describe('validateGrowthRecord', () => {
    const validPhoto: Photo = {
      id: 'photo123',
      url: 'https://example.com/photo.jpg',
      fileName: 'photo.jpg',
      uploadedAt: new Date(),
      faceDetected: true
    };

    const validComment: GrowthComment = {
      id: 'comment123',
      photoId: 'photo123',
      content: 'This is a growth comment',
      generatedAt: new Date(),
      isEdited: false
    };

    const validRecord: GrowthRecord = {
      id: 'record123',
      userId: 'user123',
      photos: [validPhoto],
      comments: [validComment],
      createdAt: new Date(),
      updatedAt: new Date(),
      isShared: false
    };

    it('should pass validation for valid record', () => {
      expect(() => validateGrowthRecord(validRecord)).not.toThrow();
    });

    it('should throw error for empty photos array', () => {
      const invalidRecord = { ...validRecord, photos: [] };
      expect(() => validateGrowthRecord(invalidRecord)).toThrow(ValidationError);
    });

    it('should throw error for invalid photo in array', () => {
      const invalidPhoto = { ...validPhoto, url: 'invalid-url' };
      const invalidRecord = { ...validRecord, photos: [invalidPhoto] };
      expect(() => validateGrowthRecord(invalidRecord)).toThrow(ValidationError);
    });
  });

  describe('validateStorybookPage', () => {
    const validPage: StorybookPage = {
      id: 'page123',
      text: 'Once upon a time...',
      imageUrl: 'https://example.com/image.jpg',
      pageNumber: 1
    };

    it('should pass validation for valid page', () => {
      expect(() => validateStorybookPage(validPage)).not.toThrow();
    });

    it('should throw error for text too long', () => {
      const invalidPage = { ...validPage, text: 'a'.repeat(501) };
      expect(() => validateStorybookPage(invalidPage)).toThrow(ValidationError);
    });

    it('should throw error for invalid page number', () => {
      const invalidPage = { ...validPage, pageNumber: 0 };
      expect(() => validateStorybookPage(invalidPage)).toThrow(ValidationError);
    });
  });

  describe('validateStorybook', () => {
    const validPage: StorybookPage = {
      id: 'page123',
      text: 'Once upon a time...',
      imageUrl: 'https://example.com/image.jpg',
      pageNumber: 1
    };

    const validStorybook: Storybook = {
      id: 'storybook123',
      userId: 'user123',
      title: 'My Story',
      month: '2024-01',
      pages: [validPage],
      createdAt: new Date(),
      isShared: false
    };

    it('should pass validation for valid storybook', () => {
      expect(() => validateStorybook(validStorybook)).not.toThrow();
    });

    it('should throw error for invalid month format', () => {
      const invalidStorybook = { ...validStorybook, month: '2024-1' };
      expect(() => validateStorybook(invalidStorybook)).toThrow(ValidationError);
    });

    it('should throw error for too many pages', () => {
      const pages = Array.from({ length: 21 }, (_, i) => ({
        ...validPage,
        id: `page${i}`,
        pageNumber: i + 1
      }));
      const invalidStorybook = { ...validStorybook, pages };
      expect(() => validateStorybook(invalidStorybook)).toThrow(ValidationError);
    });

    it('should throw error for non-sequential page numbers', () => {
      const pages = [
        { ...validPage, pageNumber: 1 },
        { ...validPage, id: 'page2', pageNumber: 3 }
      ];
      const invalidStorybook = { ...validStorybook, pages };
      expect(() => validateStorybook(invalidStorybook)).toThrow(ValidationError);
    });
  });

  describe('validateShareLink', () => {
    const validShareLink: ShareLink = {
      id: 'share123',
      contentId: 'content123',
      contentType: 'record',
      createdBy: 'user123',
      createdAt: new Date(),
      isActive: true
    };

    it('should pass validation for valid share link', () => {
      expect(() => validateShareLink(validShareLink)).not.toThrow();
    });

    it('should throw error for invalid content type', () => {
      const invalidShareLink = { ...validShareLink, contentType: 'invalid' as any };
      expect(() => validateShareLink(invalidShareLink)).toThrow(ValidationError);
    });

    it('should throw error for expires at before created at', () => {
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() - 1000);
      const invalidShareLink = { ...validShareLink, createdAt, expiresAt };
      expect(() => validateShareLink(invalidShareLink)).toThrow(ValidationError);
    });
  });

  describe('validateImageFile', () => {
    it('should pass validation for valid image file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should throw error for invalid file type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(() => validateImageFile(file)).toThrow(ValidationError);
    });

    it('should throw error for file too large', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      expect(() => validateImageFile(file)).toThrow(ValidationError);
    });
  });

  describe('validateMonth', () => {
    it('should pass validation for valid month', () => {
      expect(() => validateMonth('2024-01')).not.toThrow();
    });

    it('should throw error for invalid format', () => {
      expect(() => validateMonth('2024-1')).toThrow(ValidationError);
      expect(() => validateMonth('24-01')).toThrow(ValidationError);
    });

    it('should throw error for future month', () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(() => validateMonth(`${futureYear}-01`)).toThrow(ValidationError);
    });

    it('should throw error for year too old', () => {
      expect(() => validateMonth('2019-01')).toThrow(ValidationError);
    });
  });
});