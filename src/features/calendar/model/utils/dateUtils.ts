import { Event } from '@entities/event/model/types';

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
  const currentDate = new Date(date); // 원본 날짜 복사
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day;

  const weekDates: Date[] = [];
  // 해당 주의 일요일 날짜 계산
  const sunday = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff);

  // 일요일부터 토요일까지의 날짜를 배열에 추가
  for (let i = 0; i < 7; i++) {
    weekDates.push(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i));
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

/**
 * 특정 날짜에 해당하는 이벤트들을 필터링합니다.
 */
export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

/**
 * 주어진 날짜의 주차 정보를 "YYYY년 M월 N주" 형식으로 반환합니다.
 */
export function formatWeek(targetDate: Date) {
  const currentDate = new Date(targetDate); // 원본 날짜 복사
  const dayOfWeek = currentDate.getDay();
  const diffToThursday = 4 - dayOfWeek;

  const thursday = new Date(currentDate);
  thursday.setDate(currentDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);
  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber =
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
  const targetDate = new Date(date);
  const startDate = new Date(rangeStart);
  const endDate = new Date(rangeEnd);

  // 시간을 00:00:00으로 통일
  targetDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return targetDate >= startDate && targetDate <= endDate;
}

/**
 * 숫자를 지정된 자릿수의 문자열로 변환하고 앞을 0으로 채웁니다.
 */
export function fillZero(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

/**
 * 날짜를 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
 */
export function formatDate(currentDate: Date, day?: number): string {
  const date = new Date(currentDate); // 원본 날짜 복사
  if (day !== undefined) {
    date.setDate(day);
  }

  return [date.getFullYear(), fillZero(date.getMonth() + 1), fillZero(day ?? date.getDate())].join(
    '-'
  );
}
