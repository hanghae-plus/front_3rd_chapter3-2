import { Event, RepeatType } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

// export function compareDate(d1: Date, d2: Date) {
//   return d1.getTime() - d2.getTime();
// }

/**
 * 주어진 년도가 윤년인지 확인합니다.
 */
export function isLeapYear(year: number): boolean {
  // 400으로 나누어 떨어지면 윤년
  if (year % 400 === 0) return true;

  // 100으로 나누어 떨어지면 평년
  if (year % 100 === 0) return false;

  // 4로 나누어 떨어지면 윤년
  return year % 4 === 0;
}

/**
 * 특정 연월의 마지막 날짜를 구합니다
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 특정 날짜가 해당 월에 존재하는지 확인합니다
 *
 * TODO: 테스트 코드 구현
 */
function isValidDayInMonth(year: number, month: number, day: number): boolean {
  const lastDay = getLastDayOfMonth(year, month);
  return day <= lastDay;
}

// 일 수 더하기
export function addDays(date: Date, days: number): Date {
  const result = stripTime(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 주 더하기
export function addWeeks(date: Date, weeks: number): Date {
  // +2주 == +14일
  return addDays(date, weeks * 7);
}

// 월 더하기
export function addMonths(date: Date, months: number, originalDate = date.getDate()): Date {
  if (originalDate <= 28) {
    const result = stripTime(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  const nextMonth = date.getMonth() + months;
  const result = new Date(date.getFullYear(), nextMonth, 1);

  // 원래 일자가 다음 달에 존재하는지 확인
  if (isValidDayInMonth(result.getFullYear(), result.getMonth(), originalDate)) {
    // 존재하면 원래 일자로 설정
    result.setDate(originalDate);
  } else {
    // 존재하지 않으면 해당 월의 마지막 날로 설정
    result.setDate(getLastDayOfMonth(result.getFullYear(), result.getMonth()));
  }

  return result;
}

// 년 더하기
export function addYears(date: Date, years: number, originalDate = date.getDate()): Date {
  // 2월 29일이 아닐 경우
  if (!(date.getMonth() === 1 && originalDate === 29)) {
    const result = stripTime(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  // 2월 29일일 경우
  const nextYear = date.getFullYear() + years;
  if (isLeapYear(nextYear)) {
    return new Date(nextYear, 1, 29);
  }

  return new Date(nextYear, 1, 28);
}

// 반복 일정 데이터 생성
// - 반복 유형(매일, 매주, 매월, 매년)
// - 반복 간격
// - 종료일이 있을 경우
//  - 종료일까지 데이터 생성
// - 종료일이 없을 경우
//  - 2050년까지 데이터 생성
export function createRepeatDateRange({
  start,
  type,
  interval,
  end = '2050-12-31',
}: {
  start: string;
  type: RepeatType;
  interval: number;
  end?: string;
}): Date[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates: Date[] = [];

  let nextDate = startDate;

  while (nextDate.getTime() <= endDate.getTime()) {
    dates.push(nextDate);

    if (type === 'daily') {
      nextDate = addDays(nextDate, interval);
    } else if (type === 'weekly') {
      nextDate = addWeeks(nextDate, interval);
    } else if (type === 'monthly') {
      // FIXME: 10/31, 11/30, 12/31, ... 과 같이 반복되는 날짜를 구하기 위해서 시작 날짜를 전달하고 있습니다
      // 더 좋은 방법 찾아서 리팩토링 필요
      nextDate = addMonths(nextDate, interval, startDate.getDate());
    } else if (type === 'yearly') {
      // FIXME: 2024/02/29, 2025/02/28, ..., 2028/02/29를 구하기 위해서 시작 날짜를 전달하고 있습니다
      // 더 좋은 방법 찾아서 리팩토링 필요
      nextDate = addYears(nextDate, interval, startDate.getDate());
    }
  }

  return dates;
}
