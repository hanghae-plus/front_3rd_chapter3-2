import { RepeatDepth } from '@entities/event/model/types';

/**
 * @description 다음 윤년을 찾는 함수
 */
export function findNextLeapYear(currentYear: number, interval: number): number {
  let nextYear = currentYear + interval;
  while (!isLeapYear(nextYear)) {
    nextYear += interval;
  }
  return nextYear;
}

/**
 * @description 일간 반복의 다음 날짜를 계산하는 함수
 */
export function calculateDailyNext(date: Date, interval: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + interval);
  return newDate;
}

/**
 * @description 주간 반복의 다음 날짜를 계산하는 함수
 */
export function calculateWeeklyNext(date: Date, interval: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + interval * 7);
  return newDate;
}

/**
 * @description 윤년인지 확인하는 함수
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * @description 날짜가 2월 29일인지 확인하는 함수
 */
export function isFebruary29(date: Date): boolean {
  return date.getMonth() === 1 && date.getDate() === 29;
}

/**
 * @description 날짜를 'YYYY-MM-DD' 형식으로 변환하는 함수
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * @description 월간 반복의 다음 날짜를 계산하는 함수
 */
export function calculateMonthlyNext(
  date: Date,
  interval: number,
  depth?: 'fix' | 'last'
): Date | null {
  const newDate = new Date(date);
  const originalDay = date.getDate();
  const targetMonth = newDate.getMonth() + interval;

  newDate.setDate(1);
  newDate.setMonth(targetMonth);

  if (depth === 'last') {
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    newDate.setDate(lastDay);
    return newDate;
  }

  const monthLastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();

  if (originalDay > monthLastDay) {
    return null;
  }

  newDate.setDate(originalDay);
  return newDate;
}

/**
 * @description 연간 반복의 다음 날짜를 계산하는 함수
 */
export function calculateYearlyNext(
  date: Date,
  interval: number,
  depth: RepeatDepth = 'fix'
): Date | null {
  if (!date || interval <= 0) return null;

  const originalDay = date.getDate();
  const originalMonth = date.getMonth();
  const nextYear = date.getFullYear() + interval;

  if (depth === 'last') {
    const newDate = new Date(date);
    newDate.setFullYear(nextYear);
    const lastDayOfMonth = new Date(nextYear, originalMonth + 1, 0).getDate();
    newDate.setMonth(originalMonth);
    newDate.setDate(lastDayOfMonth);
    return newDate;
  }

  if (originalMonth === 1 && originalDay === 29) {
    let year = nextYear;
    while (year <= nextYear + 4) {
      if (new Date(year, 1, 29).getMonth() === 1) {
        const newDate = new Date(date);
        newDate.setFullYear(year);
        return newDate;
      }
      year++;
    }
    return null;
  }

  const newDate = new Date(date);
  newDate.setFullYear(nextYear);
  newDate.setMonth(originalMonth);
  newDate.setDate(originalDay);
  return newDate;
}

/**
 * @description 해당 날짜가 월의 마지막 날인지 확인하는 함수
 */
export function isLastDayOfMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() === lastDay;
}
