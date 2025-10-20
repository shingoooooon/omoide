import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

export interface AgeInfo {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  displayText: string;
}

/**
 * 誕生日から指定日時点での年齢を計算する
 */
export function calculateAge(birthDate: Date, targetDate: Date): AgeInfo {
  const years = differenceInYears(targetDate, birthDate);
  const months = differenceInMonths(targetDate, birthDate) % 12;
  const totalDays = differenceInDays(targetDate, birthDate);
  
  // 月の差分を計算するために、年数分を引いた日付を作成
  const yearAdjustedBirthDate = new Date(birthDate);
  yearAdjustedBirthDate.setFullYear(yearAdjustedBirthDate.getFullYear() + years);
  yearAdjustedBirthDate.setMonth(yearAdjustedBirthDate.getMonth() + months);
  
  const days = differenceInDays(targetDate, yearAdjustedBirthDate);

  // 表示用テキストを生成
  let displayText = '';
  
  if (years > 0) {
    displayText += `${years}歳`;
    if (months > 0) {
      displayText += `${months}ヶ月`;
    }
  } else if (months > 0) {
    displayText += `${months}ヶ月`;
    if (days > 0) {
      displayText += `${days}日`;
    }
  } else {
    displayText = `${totalDays}日`;
  }

  return {
    years,
    months,
    days,
    totalDays,
    displayText
  };
}

/**
 * 年齢情報から短縮表示テキストを生成
 */
export function getShortAgeText(ageInfo: AgeInfo): string {
  if (ageInfo.years > 0) {
    return `${ageInfo.years}歳${ageInfo.months}ヶ月`;
  } else if (ageInfo.months > 0) {
    return `${ageInfo.months}ヶ月`;
  } else {
    return `${ageInfo.totalDays}日`;
  }
}

/**
 * 誕生日が設定されているかチェック
 */
export function hasBirthDate(birthDate?: Date): boolean {
  return birthDate instanceof Date && !isNaN(birthDate.getTime());
}