import {
  checkMonthlyStorybookStatus,
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  formatMonthForDisplay,
  validateStorybookCreationRequirements
} from '@/lib/storybookUtils';

// Mock the services
jest.mock('@/lib/services/storybookService', () => ({
  getMonthlyStorybook: jest.fn()
}));

jest.mock('@/lib/services/growthRecordService', () => ({
  getMonthlyGrowthRecords: jest.fn()
}));

describe('storybookUtils', () => {
  describe('getCurrentMonth', () => {
    it('should return current month in YYYY-MM format', () => {
      const currentMonth = getCurrentMonth();
      expect(currentMonth).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getPreviousMonth', () => {
    it('should return previous month correctly', () => {
      expect(getPreviousMonth('2024-03')).toBe('2024-02');
      expect(getPreviousMonth('2024-01')).toBe('2023-12');
    });

    it('should handle current month when no parameter provided', () => {
      const prevMonth = getPreviousMonth();
      expect(prevMonth).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getNextMonth', () => {
    it('should return next month correctly', () => {
      expect(getNextMonth('2024-02')).toBe('2024-03');
      expect(getNextMonth('2024-12')).toBe('2025-01');
    });

    it('should return null for future months', () => {
      const futureMonth = '2030-01';
      expect(getNextMonth(futureMonth)).toBeNull();
    });
  });

  describe('formatMonthForDisplay', () => {
    it('should format month correctly', () => {
      expect(formatMonthForDisplay('2024-01')).toBe('2024年1月');
      expect(formatMonthForDisplay('2024-12')).toBe('2024年12月');
    });
  });

  describe('validateStorybookCreationRequirements', () => {
    it('should validate requirements correctly', () => {
      // No records
      expect(validateStorybookCreationRequirements(0, 0)).toEqual({
        isValid: false,
        message: '絵本を作成するには、少なくとも1つの成長記録が必要です。'
      });

      // Records but no comments
      expect(validateStorybookCreationRequirements(2, 0)).toEqual({
        isValid: false,
        message: '絵本を作成するには、写真にコメントが必要です。まずコメントを生成してください。'
      });

      // Few records with comments
      expect(validateStorybookCreationRequirements(2, 2)).toEqual({
        isValid: true,
        message: '記録が少ないため、短い絵本になります。より多くの記録があると、より豊かな物語になります。'
      });

      // Sufficient records
      expect(validateStorybookCreationRequirements(5, 5)).toEqual({
        isValid: true,
        message: '絵本を作成する準備が整いました。'
      });
    });
  });

  describe('checkMonthlyStorybookStatus', () => {
    const { getMonthlyStorybook } = require('@/lib/services/storybookService');
    const { getMonthlyGrowthRecords } = require('@/lib/services/growthRecordService');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct status when storybook exists', async () => {
      getMonthlyStorybook.mockResolvedValue({ id: 'storybook1' });
      getMonthlyGrowthRecords.mockResolvedValue([]);

      const status = await checkMonthlyStorybookStatus('user1', '2024-01');

      expect(status).toEqual({
        hasStorybook: true,
        hasRecords: false,
        recordCount: 0,
        commentCount: 0,
        canCreateStorybook: false,
        message: 'この月の絵本は既に作成されています'
      });
    });

    it('should return correct status when no records exist', async () => {
      getMonthlyStorybook.mockResolvedValue(null);
      getMonthlyGrowthRecords.mockResolvedValue([]);

      const status = await checkMonthlyStorybookStatus('user1', '2024-01');

      expect(status).toEqual({
        hasStorybook: false,
        hasRecords: false,
        recordCount: 0,
        commentCount: 0,
        canCreateStorybook: false,
        message: 'この月の成長記録がありません'
      });
    });

    it('should return correct status when records exist but no comments', async () => {
      getMonthlyStorybook.mockResolvedValue(null);
      getMonthlyGrowthRecords.mockResolvedValue([
        { id: '1', comments: [] },
        { id: '2', comments: [] }
      ]);

      const status = await checkMonthlyStorybookStatus('user1', '2024-01');

      expect(status).toEqual({
        hasStorybook: false,
        hasRecords: true,
        recordCount: 2,
        commentCount: 0,
        canCreateStorybook: false,
        message: 'コメントが不足しています。まず写真にコメントを生成してください。'
      });
    });

    it('should return correct status when storybook can be created', async () => {
      getMonthlyStorybook.mockResolvedValue(null);
      getMonthlyGrowthRecords.mockResolvedValue([
        { id: '1', comments: [{ id: 'c1' }, { id: 'c2' }] },
        { id: '2', comments: [{ id: 'c3' }] }
      ]);

      const status = await checkMonthlyStorybookStatus('user1', '2024-01');

      expect(status).toEqual({
        hasStorybook: false,
        hasRecords: true,
        recordCount: 2,
        commentCount: 3,
        canCreateStorybook: true,
        message: '絵本を作成できます'
      });
    });

    it('should handle invalid month format', async () => {
      const status = await checkMonthlyStorybookStatus('user1', 'invalid-month');

      expect(status.canCreateStorybook).toBe(false);
      expect(status.message).toBe('ステータスの確認中にエラーが発生しました');
    });
  });
});