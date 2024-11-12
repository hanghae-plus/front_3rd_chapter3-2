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

// date-formatters.ts
/**
 * @description 날짜를 'YYYY-MM-DD' 형식으로 변환하는 함수
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// next-date-calculators.ts
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
 * @description 월간 반복의 다음 날짜를 계산하는 함수
 */
export function calculateMonthlyNext(date: Date, interval: number): Date | null {
  if (isFebruary29(date)) {
    return null;
  }
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + interval);
  return newDate;
}

/**
 * @description 연간 반복의 다음 날짜를 계산하는 함수
 */
export function calculateYearlyNext(date: Date, interval: number): Date | null {
  const newDate = new Date(date);

  if (isFebruary29(date)) {
    const nextYear = findNextLeapYear(date.getFullYear(), interval);
    const endDate = new Date(date);
    endDate.setFullYear(nextYear);

    if (endDate > new Date(date)) {
      newDate.setFullYear(nextYear);
      newDate.setMonth(1);
      newDate.setDate(29);
      return newDate;
    }
    return null;
  }

  newDate.setFullYear(date.getFullYear() + interval);
  return newDate;
}
