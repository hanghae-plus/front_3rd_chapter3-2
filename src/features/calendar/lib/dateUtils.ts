import { Event } from '../../../entities/event/model/type.ts';
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

export const isLeapYear = (year: number): boolean => {
  if (year % 400 === 0) return true;

  if (year % 100 === 0) return false;

  return year % 4 === 0;
};

export function generateRecurringEvents(
  startDate: string,
  interval: number,
  repeatType: string,
  endDate: string
): string[] {
  const dates = [];
  let currentDate = new Date(startDate);
  const targetEndDate = new Date(endDate);

  const targetDay = currentDate.getDate();

  const getMonthlyNextEventDate = (date: Date, interval: number): Date => {
    const originalDay = targetDay;
    let targetMonth = date.getMonth() + interval;
    let targetYear = date.getFullYear();

    if (targetMonth > 11) {
      targetYear += Math.floor(targetMonth / 12);
      targetMonth %= 12;
    }

    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const adjustedDay = Math.min(originalDay, lastDayOfTargetMonth);

    return new Date(targetYear, targetMonth, adjustedDay);
  };

  const getYearlyNextEventDate = (date: Date, interval: number): Date => {
    const month = date.getMonth();
    const day = date.getDate();
    let targetYear = date.getFullYear() + interval;

    if (month === 1 && day === 29 && !isLeapYear(targetYear)) {
      return new Date(targetYear, 1, 28);
    }
    return new Date(targetYear, month, day);
  };

  while (currentDate <= targetEndDate) {
    dates.push(formatDate(currentDate));

    switch (repeatType) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;

      case 'weekly':
        currentDate.setDate(currentDate.getDate() + interval * 7);
        break;

      case 'monthly':
        currentDate = getMonthlyNextEventDate(currentDate, interval);
        break;

      case 'yearly':
        currentDate = getYearlyNextEventDate(currentDate, interval);
        break;

      default:
        return dates;
    }
  }

  return dates;
}
