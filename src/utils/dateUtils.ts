import { Event } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return month > 12 ? 0 : new Date(year, month, 0).getDate();
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

export function getEventsForDay(events: Event[], currentDate: string): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    const current = new Date(currentDate);

    switch (event.repeat.type) {
      case 'yearly':
        return isYearlyInRange(event, event.repeat.endDate!, currentDate);
      case 'monthly':
        return isMonthlyInRange(event, event.repeat.endDate!, currentDate);
      case 'weekly':
        return isWeeklyInRange(event, event.repeat.endDate!, currentDate);
      case 'daily':
        return isDailyInRange(event, event.repeat.endDate!, currentDate);
      default:
        return eventDate.getDate() === current.getDate();
    }
  });
}

function isYearlyInRange(event: Event, rangeEnd: string, currentDate: string) {
  const { date, repeat, exceptionList } = event;
  if (exceptionList.includes(currentDate)) return false;

  const eventDate = new Date(date);
  const current = new Date(currentDate);
  const end = rangeEnd ? new Date(rangeEnd) : null;

  const lastDayOfCurrentMonth = getLastDayInMonth(current);
  const isEventDateLastDay = eventDate.getDate() === getLastDayInMonth(eventDate);

  const isEqualMonth = current.getMonth() === eventDate.getMonth();

  const isEqualDay =
    (isEventDateLastDay && current.getDate() === lastDayOfCurrentMonth) ||
    current.getDate() === eventDate.getDate();

  const yearsDiff = current.getFullYear() - eventDate.getFullYear();
  return (
    (!rangeEnd || (end && end >= current)) && // 범위 종료일 확인
    current >= eventDate && // 현재 날짜가 이벤트 시작일 이후인지 확인
    isEqualMonth && // 달이 같은지 확인
    isEqualDay && // 일(day)이 같은지 확인
    yearsDiff % repeat.interval === 0 // interval 주기에 맞는 월인지 확인
  );
}

function isMonthlyInRange(event: Event, rangeEnd: string, currentDate: string) {
  const { date, repeat, exceptionList } = event;
  if (exceptionList.includes(currentDate)) return false;

  const eventDate = new Date(date);
  const current = new Date(currentDate);
  const end = rangeEnd ? new Date(rangeEnd) : null;

  const monthsDiff =
    (current.getFullYear() - eventDate.getFullYear()) * 12 +
    (current.getMonth() - eventDate.getMonth());

  const isCurrentDateLastDay = current.getDate() === getLastDayInMonth(current);

  const isEventDateLastDay = eventDate.getDate() === getLastDayInMonth(eventDate);

  // 이벤트가 말일이면 말일 / 아니면 같은 일 기준
  const isEqualDay = isEventDateLastDay
    ? isCurrentDateLastDay
    : current.getDate() === eventDate.getDate();

  return (
    (!rangeEnd || (end && end >= current)) && // 범위 종료일 확인
    current >= eventDate && // 현재 날짜가 이벤트 시작일 이후인지 확인
    isEqualDay && // 일(day)이 같은지 확인
    monthsDiff % repeat.interval === 0 // interval 주기에 맞는 월인지 확인
  );
}

function isWeeklyInRange(event: Event, rangeEnd: string, currentDate: string) {
  const { date, repeat, exceptionList } = event;
  if (exceptionList.includes(currentDate)) return false;

  const eventDate = new Date(date);
  const current = new Date(currentDate);
  const end = new Date(rangeEnd);

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const weeksDiff = Math.floor((current.getTime() - eventDate.getTime()) / ONE_WEEK_MS);

  return (
    (!rangeEnd || end >= current) && // 범위 종료일 확인
    current >= eventDate && // 현재 날짜가 이벤트 시작일 이후인지 확인
    current.getDay() === eventDate.getDay() && // 일(day)이 같은지 확인
    weeksDiff % repeat.interval === 0 // interval 주기에 맞는 주인지 확인
  );
}

function isDailyInRange(event: Event, rangeEnd: string, currentDate: string) {
  const { date, repeat, exceptionList } = event;
  if (exceptionList.includes(currentDate)) return false;

  const eventDate = new Date(date);
  const current = new Date(currentDate);
  const end = new Date(rangeEnd);

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((current.getTime() - eventDate.getTime()) / ONE_DAY_MS);

  return (
    (!rangeEnd || end >= current) && // 범위 종료일 확인
    current >= eventDate && // 현재 날짜가 이벤트 시작일 이후인지 확인
    dayDiff % repeat.interval === 0 // interval 주기에 맞는 일인지 확인
  );
}

// 날짜에 해당하는 달의 말일 반환
function getLastDayInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = fillZero(thursday.getMonth() + 1);

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

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return date >= rangeStart && date <= rangeEnd;
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

/**
 * 현재 날짜에서 offset 일수만큼 전/후 날짜를 반환하는 함수
 * @param daysOffset - 양수이면 이후 날짜, 음수이면 이전 날짜
 * @returns 계산된 날짜 객체
 */
export function getDateWithOffset(currentDate: Date, daysOffset: number): Date {
  currentDate.setDate(currentDate.getDate() + daysOffset);
  return currentDate;
}
