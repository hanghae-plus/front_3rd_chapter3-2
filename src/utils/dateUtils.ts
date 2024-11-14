import { Event, EventForm } from '../types.ts';

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
 * 주어진 날짜를 기준으로 반복 날짜를 계산합니다.
 */
export function calculateNextDate(
  currentDate: string,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number = 1
): string {
  // 현재 날짜 문자열을 연, 월, 일로 분리
  const [yearStr, monthStr, dayStr] = currentDate.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1;
  let day = parseInt(dayStr, 10);

  // Date 객체 생성
  let date = new Date(year, month, day);

  switch (repeatType) {
    case 'daily':
      // 하루 추가
      date.setDate(date.getDate() + interval);
      break;

    case 'weekly':
      // 일주일 추가
      date.setDate(date.getDate() + 7 * interval);
      break;

    case 'monthly':
      {
        // 현재 날짜를 유지
        const currentDay = date.getDate();
        // 다음 달의 일수 확인
        const daysInNextMonth = getDaysInMonth(date.getFullYear(), date.getMonth() + interval + 1);

        // 현재 일이 다음 달에 존재하지 않으면 마지막 날로 조정
        if (currentDay > daysInNextMonth) {
          date.setDate(daysInNextMonth);
        } else {
          date.setDate(currentDay);
        }
        // 한 달 추가
        date.setMonth(date.getMonth() + interval);
      }
      break;

    case 'yearly':
      {
        // 현재 날짜를 유지
        const currentMonth = date.getMonth();
        const currentDay = date.getDate();
        // 다음 해의 해당 월 일수 확인
        const daysInNextYearMonth = getDaysInMonth(date.getFullYear() + interval, currentMonth + 1);

        // 현재 일이 다음 해의 해당 월에 존재하지 않으면 마지막 날로 조정
        if (currentDay > daysInNextYearMonth) {
          date.setDate(daysInNextYearMonth);
        } else {
          date.setDate(currentDay);
        }
        // 한 해 추가
        date.setFullYear(date.getFullYear() + interval);
      }
      break;

    default:
      throw new Error('유효하지 않은 반복 유형입니다.');
  }
  // 반복 간격이 1 이상인지 확인
  if (interval < 1) {
    throw new Error('반복 간격은 1 이상의 정수여야 합니다.');
  }
  // 'YYYY-MM-DD' 형식으로 날짜를 포맷
  return formatDate(date);
}

/**
 * 주어진 이벤트 데이터를 기반으로 반복 이벤트를 생성합니다.
 */
export function generateRepeatingEvents(eventData: Event | EventForm): Event | EventForm[] {
  const { repeat } = eventData;

  // 반복 유형이 'none'인 경우, 원본 이벤트만 반환
  if (repeat.type === 'none') {
    return [eventData];
  }

  // 반복 간격이 1 이상인지 확인
  if (repeat.interval < 1) {
    throw new Error('반복 간격은 1 이상의 정수여야 합니다.');
  }

  // 종료 날짜가 설정되어 있는지 확인
  if (!repeat.endDate) {
    throw new Error('반복 종료 날짜가 필요합니다.');
  }

  const dates: string[] = [];
  let currentDate = eventData.date;

  // 반복 종료 조건을 명확히 설정하여 무한 루프 방지
  while (currentDate <= repeat.endDate) {
    dates.push(currentDate);
    const nextDate = calculateNextDate(currentDate, repeat.type, repeat.interval);

    // 다음 날짜가 유효하지 않거나 현재 날짜와 같거나 이전 날짜인 경우 루프 종료
    if (!nextDate || nextDate <= currentDate) {
      break;
    }

    currentDate = nextDate;
  }

  // 생성된 날짜들을 기반으로 새로운 이벤트 데이터 리스트 생성
  return dates.map((date) => ({
    ...eventData,
    date,
    id: undefined,
  }));
}
