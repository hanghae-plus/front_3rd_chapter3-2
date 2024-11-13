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

  // 먼저 1일로 설정 후 월 이동 (롤오버 방지)
  newDate.setDate(1);
  newDate.setMonth(targetMonth);

  if (depth === 'last') {
    // last인 경우 해당 월의 마지막 날짜로 설정
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    newDate.setDate(lastDay);
    return newDate;
  }

  // fix인 경우
  // 해당 월의 마지막 날짜 확인
  const monthLastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();

  // 원본 날짜가 해당 월의 마지막 날보다 크면 null 반환
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
  depth?: RepeatDepth
): Date | null {
  const originalDay = date.getDate();
  const originalMonth = date.getMonth();

  // 2월 29일 특별 처리
  if (originalMonth === 1 && originalDay === 29) {
    let nextYear = date.getFullYear() + interval;
    // 윤년이 나올 때까지 계속 다음 해를 확인
    while (!isLeapYear(nextYear)) {
      nextYear += interval;
    }
    const newDate = new Date(date);
    newDate.setFullYear(nextYear);
    newDate.setMonth(1);
    newDate.setDate(29);
    return newDate;
  }

  // 나머지 날짜 처리
  let nextYear = date.getFullYear() + interval;
  const newDate = new Date(date);
  newDate.setFullYear(nextYear); // 먼저 년도 설정

  // last 처리 (월의 마지막 날로 설정해야 하는 경우)
  if (depth === 'last') {
    const lastDay = new Date(nextYear, originalMonth + 1, 0).getDate();
    newDate.setMonth(originalMonth);
    newDate.setDate(lastDay);
    return newDate;
  }

  // 일반적인 경우 (fix)
  // 해당 월의 마지막 날짜 확인
  const monthLastDay = new Date(nextYear, originalMonth + 1, 0).getDate();

  // 원래 날짜가 해당 월의 마지막 날짜보다 작거나 같으면 그대로 유지
  if (originalDay <= monthLastDay) {
    newDate.setMonth(originalMonth);
    newDate.setDate(originalDay);
    return newDate;
  }

  return null;
}

/**
 * @description 해당 날짜가 월의 마지막 날인지 확인하는 함수
 */
export function isLastDayOfMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() === lastDay;
}
