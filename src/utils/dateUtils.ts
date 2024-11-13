import { Event } from '../types.ts';

const MAX_END_DATE = '2025-06-30';
const NUM_OF_WEEK = 7;

export type WeekType = 'none' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type MonthType =
  | 'none'
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

const dayMap: Record<WeekType, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  none: -1,
};

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

/**
 * 주어진 날짜가 속한 월의 모든 날짜를 반환합니다.
 */
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
 * 주어진 날짜에 속한 이벤트를 반환합니다.
 */
export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

/**
 * 주어진 날짜의 연도, 월, 주차 정보 "YYYY년 M월 w주" 형식으로 반환합니다.
 */
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

/**
 * 한 자리수의 날짜는 0을 붙여 두 자리수의 날짜로 반환합니다.
 */
export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

/**
 * 주어진 날짜를 "YYYY-MM-DD" 형식으로 반환합니다.
 */
export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

/**
 * 주어진 날짜가 윤년에 해당하는지 boolean 값으로 반환합니다.
 */
export function isLeapYear(targetDate: Date): boolean {
  // 연도 추출
  const year = targetDate.getFullYear();

  const FOUR = 4;
  const HUNDRED = 100;
  // 윤년 확인
  if (year % (FOUR * HUNDRED) === 0) return true;
  if (year % HUNDRED === 0) return false;
  return year % FOUR === 0;
}

/**
 * 현재 날짜부터 종료 날짜까지 설정된 간격으로 남은 날짜들을 반환합니다.
 */
export function getRemainingDatesByDay(
  currentDate: Date = new Date(),
  endDate: Date = new Date(MAX_END_DATE),
  interval: number = 1
) {
  const dates: Date[] = [];

  // 종료일이 시작일보다 이전인 경우 빈 배열 반환합니다.
  if (endDate < currentDate) {
    return dates;
  }

  // 간격이 0보다 작거나 같을 경우 빈 배열을 반환합니다.
  if (interval <= 0) {
    return dates;
  }

  // 현재일자는 포함하지 않는다.
  let current = new Date(currentDate);
  current.setDate(current.getDate() + interval);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + interval);
  }
  return dates;
}

/**
 * 주어진 날짜의 요일을 short 형태의 string으로 반환합니다. (예: mon, tue, wed, ...)
 */
export function getWeekday(date: Date): WeekType {
  try {
    const weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    return weekdayFormat.format(date).toLowerCase() as WeekType;
  } catch (error) {
    return 'none';
  }
}

/**
 * 지정된 요일에 해당하는 날짜들을 시작일부터 종료일까지 반환합니다.
 */
export function getRemainingDatesByWeek(
  currentDate: Date = new Date(),
  endDate: Date = new Date(MAX_END_DATE),
  interval: number = 1,
  weekType: WeekType = 'none'
): Date[] {
  const dates: Date[] = [];

  // 종료일자가 시작일자보다 이전인 경우 빈 배열을 반환합니다.
  if (endDate < currentDate) {
    return dates;
  }

  // 간격이 0보다 작은 경우 빈 배열을 반환합니다.
  if (interval <= 0) {
    return dates;
  }

  // 요일를 설정하지 않은 경우 빈 배열을 반환합니다.
  if (weekType === 'none') {
    return dates;
  }

  return getRemainingDatesByDay(currentDate, endDate, NUM_OF_WEEK);
}

/**
 * 유효한 날짜인지 확인합니다.
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 특정 월의 N번째 요일의 날짜를 반환합니다.
 * 해당 월에 N번째 요일이 없는 경우 null을 반환합니다.
 */
export function getNthWeekday(date: Date, nth: number, weekType: WeekType): Date | null {
  if (weekType === 'none') return null;

  const year = date.getFullYear();
  const month = date.getMonth();

  const targetDayIndex = dayMap[weekType];

  // 해당 월의 1일로 설정
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  // 첫 번째 해당 요일까지의 날짜 차이 계산
  let dayDiff = targetDayIndex - firstWeekday;
  if (dayDiff < 0) dayDiff += 7;

  // n번째 해당 요일의 날짜 계산
  const targetDate = new Date(year, month, 1 + dayDiff + (nth - 1) * 7);

  // 해당 월의 유효한 날짜인지 확인
  if (targetDate.getMonth() !== month) {
    return null;
  }

  return targetDate;
}


// getRemainingDatesByYear

// TODO 반복일정 반복유형 선택 - 매일/매주/매월/매년
// TODO 날짜 더하기
// TODO 매월 이벤트 시 말일의 경우
// TODO 매월-매주 이벤트 시 윤년(2월29일) 이벤트 경우 어떻게 함?
// TODO 반복일정 - 반복간격
// TODO 1. 반복간격 - 매일일 시 시간
// TODO 2. 반복간격 - 매주일 시 요일
// TODO 3. 반복간격 - 매월일 시 일, 주차-요일
// TODO 4. 반복간격 - 매년일 시 월-일, 주차-요일
// TODO 5. 일 - 간격 입력 (예: 2일마다)
// TODO 6. 주 - 간격 입력 (예: 3주마다)
// TODO 7. 월 - 간격 입력 (예: 2개월마다)
// TODO 8. 연 - 가격 입력 (예: 2년마다)
// TODO 9. 1일, 1주, 1개월, 1년은 매일/매주/메월/매년이 존재하므로 2부터 시작한다.
// TODO 반복일정 - 반복종료일 2099.12.31
