// 使用量追跡とコスト管理

interface UsageStats {
  dailyRequests: number;
  monthlyRequests: number;
  lastRequestDate: string;
  estimatedCost: number;
}

const DAILY_LIMIT = 20;  // 1日20回まで
const MONTHLY_LIMIT = 300; // 1ヶ月300回まで
const COST_PER_REQUEST = 0.002; // 約0.2円/回（GPT-4o-mini想定）

// ローカルストレージキー
const USAGE_KEY = 'openai_usage_stats';

export function getUsageStats(): UsageStats {
  if (typeof window === 'undefined') {
    return {
      dailyRequests: 0,
      monthlyRequests: 0,
      lastRequestDate: new Date().toISOString().split('T')[0],
      estimatedCost: 0
    };
  }

  const stored = localStorage.getItem(USAGE_KEY);
  if (!stored) {
    return {
      dailyRequests: 0,
      monthlyRequests: 0,
      lastRequestDate: new Date().toISOString().split('T')[0],
      estimatedCost: 0
    };
  }

  const stats = JSON.parse(stored);
  const today = new Date().toISOString().split('T')[0];
  
  // 日付が変わったらデイリーカウントをリセット
  if (stats.lastRequestDate !== today) {
    stats.dailyRequests = 0;
    stats.lastRequestDate = today;
  }

  // 月が変わったらマンスリーカウントをリセット
  const currentMonth = new Date().toISOString().substring(0, 7);
  const lastMonth = stats.lastRequestDate.substring(0, 7);
  if (currentMonth !== lastMonth) {
    stats.monthlyRequests = 0;
    stats.estimatedCost = 0;
  }

  return stats;
}

export function canMakeRequest(): { allowed: boolean; reason?: string } {
  const stats = getUsageStats();
  
  if (stats.dailyRequests >= DAILY_LIMIT) {
    return { 
      allowed: false, 
      reason: `1日の制限（${DAILY_LIMIT}回）に達しました。明日再度お試しください。` 
    };
  }
  
  if (stats.monthlyRequests >= MONTHLY_LIMIT) {
    return { 
      allowed: false, 
      reason: `月間制限（${MONTHLY_LIMIT}回）に達しました。来月再度お試しください。` 
    };
  }
  
  return { allowed: true };
}

export function recordRequest(): void {
  if (typeof window === 'undefined') return;
  
  const stats = getUsageStats();
  stats.dailyRequests += 1;
  stats.monthlyRequests += 1;
  stats.estimatedCost += COST_PER_REQUEST;
  
  localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
}

export function resetUsage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USAGE_KEY);
}