import { getMonthlyStorybook } from '@/lib/services/storybookService';
import { getMonthlyGrowthRecords } from '@/lib/services/growthRecordService';
import { validateMonth } from '@/lib/validation';

export interface MonthlyStorybookStatus {
  hasStorybook: boolean;
  hasRecords: boolean;
  recordCount: number;
  commentCount: number;
  canCreateStorybook: boolean;
  message?: string;
}

// Check if a storybook can be created for a given month
export async function checkMonthlyStorybookStatus(
  userId: string, 
  month: string
): Promise<MonthlyStorybookStatus> {
  try {
    // Validate month format
    validateMonth(month);

    const [year, monthNum] = month.split('-').map(Number);

    // Check if storybook already exists
    const existingStorybook = await getMonthlyStorybook(userId, month);
    const hasStorybook = existingStorybook !== null;

    // Get monthly records
    const records = await getMonthlyGrowthRecords(userId, year, monthNum);
    const hasRecords = records.length > 0;
    const recordCount = records.length;
    const commentCount = records.reduce((sum, record) => sum + record.comments.length, 0);

    let canCreateStorybook = false;
    let message: string | undefined;

    if (hasStorybook) {
      message = 'この月の絵本は既に作成されています';
    } else if (!hasRecords) {
      message = 'この月の成長記録がありません';
    } else if (commentCount === 0) {
      message = 'コメントが不足しています。まず写真にコメントを生成してください。';
    } else {
      canCreateStorybook = true;
      message = '絵本を作成できます';
    }

    return {
      hasStorybook,
      hasRecords,
      recordCount,
      commentCount,
      canCreateStorybook,
      message
    };

  } catch (error) {
    console.error('Error checking monthly storybook status:', error);
    return {
      hasStorybook: false,
      hasRecords: false,
      recordCount: 0,
      commentCount: 0,
      canCreateStorybook: false,
      message: 'ステータスの確認中にエラーが発生しました'
    };
  }
}

// Get current month in YYYY-MM format
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

// Get previous month in YYYY-MM format
export function getPreviousMonth(month?: string): string {
  const targetMonth = month || getCurrentMonth();
  const [year, monthNum] = targetMonth.split('-').map(Number);
  
  if (monthNum === 1) {
    return `${year - 1}-12`;
  } else {
    return `${year}-${(monthNum - 1).toString().padStart(2, '0')}`;
  }
}

// Get next month in YYYY-MM format (up to current month)
export function getNextMonth(month: string): string | null {
  const [year, monthNum] = month.split('-').map(Number);
  const currentMonth = getCurrentMonth();
  
  let nextMonth: string;
  if (monthNum === 12) {
    nextMonth = `${year + 1}-01`;
  } else {
    nextMonth = `${year}-${(monthNum + 1).toString().padStart(2, '0')}`;
  }
  
  // Don't return future months
  if (nextMonth > currentMonth) {
    return null;
  }
  
  return nextMonth;
}

// Format month for display (YYYY-MM -> YYYY年M月)
export function formatMonthForDisplay(month: string): string {
  const [year, monthNum] = month.split('-');
  return `${year}年${parseInt(monthNum)}月`;
}

// Get available months for storybook creation
export async function getAvailableMonthsForStorybook(
  userId: string,
  maxMonths: number = 12
): Promise<{ month: string; status: MonthlyStorybookStatus }[]> {
  const months: { month: string; status: MonthlyStorybookStatus }[] = [];
  let currentMonth = getCurrentMonth();
  
  for (let i = 0; i < maxMonths; i++) {
    const status = await checkMonthlyStorybookStatus(userId, currentMonth);
    months.push({ month: currentMonth, status });
    
    const prevMonth = getPreviousMonth(currentMonth);
    if (!prevMonth) break;
    currentMonth = prevMonth;
  }
  
  return months;
}

// Validate storybook creation requirements
export function validateStorybookCreationRequirements(
  recordCount: number,
  commentCount: number
): { isValid: boolean; message?: string } {
  if (recordCount === 0) {
    return {
      isValid: false,
      message: '絵本を作成するには、少なくとも1つの成長記録が必要です。'
    };
  }

  if (commentCount === 0) {
    return {
      isValid: false,
      message: '絵本を作成するには、写真にコメントが必要です。まずコメントを生成してください。'
    };
  }

  if (recordCount < 3) {
    return {
      isValid: true,
      message: '記録が少ないため、短い絵本になります。より多くの記録があると、より豊かな物語になります。'
    };
  }

  return {
    isValid: true,
    message: '絵本を作成する準備が整いました。'
  };
}