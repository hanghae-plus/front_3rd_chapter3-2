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

/**
 * 해당 날짜가 윤년인지 체크
 */
export const isLeapYear = (year: number) => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

/**
 * 추가할 데이터 반환
 */
export const getNextData = (currentDate: Date, type: RepeatType, interval: number) => {
  const newDate = new Date(currentDate);

  switch (type) {
    case 'yearly':
      newDate.setFullYear(currentDate.getFullYear() + interval);

      // 윤년 처리: 2월 29일이 포함된 경우, 윤년이 아닐 경우 2월 28일로 설정
      if (newDate.getMonth() === 1 && newDate.getDate() === 29) {
        newDate.setDate(28);
      }
      break;

    case 'monthly':
      newDate.setMonth(currentDate.getMonth() + interval);

      // 월 말 처리: 새로 계산된 날짜가 원래 날짜와 다를 경우
      if (newDate.getDate() !== currentDate.getDate()) {
        // 예를 들어, 1월 31일 -> 2월 28일(윤년 고려)
        newDate.setDate(0); // 이전 월의 마지막 날로 설정
      }
      break;

    case 'weekly':
      newDate.setDate(currentDate.getDate() + interval * 7); // 주 단위로 날짜를 계산 (interval * 7일)
      break;

    case 'daily':
      newDate.setDate(currentDate.getDate() + interval); // 일 단위로 날짜를 계산
      break;

    default:
      break;
  }

  // 결과를 'YYYY-MM-DD' 형식으로 반환
  return newDate.toISOString().split('T')[0];
};
