// Integration tests for Growth Record Service
// Note: These tests would require Firebase emulator setup for full integration testing

import { 
  GrowthRecord, 
  Photo, 
  GrowthComment 
} from '@/types/models';
import { validateGrowthRecord } from '@/lib/validation';

// Mock Firebase functions for unit testing
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn()
}));

describe('Growth Record Service', () => {
  const mockPhoto: Photo = {
    id: 'photo123',
    url: 'https://example.com/photo.jpg',
    fileName: 'photo.jpg',
    uploadedAt: new Date(),
    faceDetected: true
  };

  const mockComment: GrowthComment = {
    id: 'comment123',
    photoId: 'photo123',
    content: 'This is a growth comment',
    generatedAt: new Date(),
    isEdited: false
  };

  const mockRecord: GrowthRecord = {
    id: 'record123',
    userId: 'user123',
    photos: [mockPhoto],
    comments: [mockComment],
    createdAt: new Date(),
    updatedAt: new Date(),
    isShared: false
  };

  describe('Data Validation', () => {
    it('should validate a complete growth record', () => {
      expect(() => validateGrowthRecord(mockRecord)).not.toThrow();
    });

    it('should validate record during creation (without ID)', () => {
      const recordForCreation = { ...mockRecord, id: '' };
      expect(() => validateGrowthRecord(recordForCreation, true)).not.toThrow();
    });

    it('should handle records with multiple photos and comments', () => {
      const recordWithMultiple: GrowthRecord = {
        ...mockRecord,
        photos: [
          mockPhoto,
          { ...mockPhoto, id: 'photo456', fileName: 'photo2.jpg' }
        ],
        comments: [
          mockComment,
          { ...mockComment, id: 'comment456', content: 'Another comment' }
        ]
      };

      expect(() => validateGrowthRecord(recordWithMultiple)).not.toThrow();
    });

    it('should handle shared records', () => {
      const sharedRecord: GrowthRecord = {
        ...mockRecord,
        isShared: true,
        sharedLink: 'abc123def456'
      };

      expect(() => validateGrowthRecord(sharedRecord)).not.toThrow();
    });
  });

  describe('Service Functions Structure', () => {
    // These tests verify the service functions exist and have correct signatures
    // Full functionality testing would require Firebase emulator

    it('should have all required service functions', async () => {
      const {
        createGrowthRecord,
        getGrowthRecord,
        getUserGrowthRecords,
        getMonthlyGrowthRecords,
        updateGrowthRecord,
        deleteGrowthRecord,
        updateGrowthRecordSharing,
        getSharedGrowthRecord
      } = await import('../growthRecordService');

      expect(typeof createGrowthRecord).toBe('function');
      expect(typeof getGrowthRecord).toBe('function');
      expect(typeof getUserGrowthRecords).toBe('function');
      expect(typeof getMonthlyGrowthRecords).toBe('function');
      expect(typeof updateGrowthRecord).toBe('function');
      expect(typeof deleteGrowthRecord).toBe('function');
      expect(typeof updateGrowthRecordSharing).toBe('function');
      expect(typeof getSharedGrowthRecord).toBe('function');
    });
  });
});