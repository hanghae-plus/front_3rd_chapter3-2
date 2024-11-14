import { Event, RepeatInfo } from '../types.ts';

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

// 월 인덱스 맵핑
const monthMap: Record<MonthType, number> = {
  none: -1,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
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

  const targetWeekType = weekType === 'none' ? getWeekday(currentDate) : weekType;

  let current = new Date(currentDate);
  const currentDayIndex = current.getDay();
  const targetDayIndex = dayMap[targetWeekType];

  // 지정된 요일까지의 날짜 차이 계산
  let daysToAdd = targetDayIndex - currentDayIndex;
  if (daysToAdd <= 0) {
    daysToAdd += NUM_OF_WEEK; // 다음 주로 이동
  }

  // 첫 번째 해당 요일로 이동
  current.setDate(current.getDate() + daysToAdd);

  // interval 주 간격으로 날짜 추가
  while (current <= endDate) {
    // 현재 날짜가 시작일 이후인 경우만 추가
    if (current.getTime() > currentDate.getTime()) {
      dates.push(new Date(current));
    }
    // interval 주 후로 이동
    current.setDate(current.getDate() + NUM_OF_WEEK * interval);
  }
  return dates;
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

/**
 * 지정된 월에 해당하는 날짜들을 시작일부터 종료일까지 반환합니다.
 */
export function getRemainingDatesByMonth(
  currentDate: Date = new Date(),
  endDate: Date = new Date(MAX_END_DATE),
  interval: number = 1,
  weekType: WeekType = 'none',
  day?: number,
  weekOrder?: number
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

  // day가 0이나 음수인 경우 빈 배열을 반환합니다.
  if (day !== undefined && day <= 0) {
    return dates;
  }

  // 시작일의 년월을 기준으로 처리
  let current = new Date(currentDate);
  let year = current.getFullYear();
  let month = current.getMonth();

  while (current <= endDate) {
    let dateToAdd: Date | null = null;

    if (weekType !== 'none' && weekOrder !== undefined) {
      // N번째 요일 처리
      dateToAdd = getNthWeekday(current, weekOrder, weekType);
    } else if (day !== undefined) {
      const lastDayOfMonth = getDaysInMonth(year, month + 1);

      // 말일 처리
      dateToAdd = new Date(year, month, Math.min(day, lastDayOfMonth));
    } else {
      day = currentDate.getDate();
      dateToAdd = new Date(year, month, day);
    }

    // 유효한 날짜이고 종료일 이전인 경우에만 추가
    // 현재 날짜와 같은 날짜는 제외
    if (
      dateToAdd &&
      isValidDate(dateToAdd) &&
      dateToAdd <= endDate &&
      dateToAdd.getTime() > currentDate.getTime()
    ) {
      dates.push(dateToAdd);
    }

    // 다음 간격으로 이동
    month += interval;
    if (month >= 12) {
      year += Math.floor(month / 12);
      month = month % 12;
    }
    current = new Date(year, month, 1);
  }

  return dates;
}

/**
 * 주어진 날짜의 월을 MonthType 형태로 반환합니다.
 */
export function getMonth(currentDate: Date): MonthType {
  try {
    const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short' });
    return monthFormat.format(currentDate).toLowerCase() as MonthType;
  } catch (error) {
    return 'none';
  }
}

/**
 * 지정된 규칙의 연도에 해당하는 날짜들을 시작일부터 종료일까지 반환합니다.
 */
export function getRemainingDatesByYear(
  currentDate: Date = new Date(),
  endDate: Date = new Date(MAX_END_DATE),
  interval: number = 1,
  monthType: MonthType = 'none',
  weekType: WeekType = 'none',
  day?: number,
  weekOrder?: number
): Date[] {
  const dates: Date[] = [];

  // 기본 유효성 검사
  if (endDate < currentDate) {
    return dates;
  }

  if (interval <= 0) {
    return dates;
  }

  // day가 0이나 음수인 경우 빈 배열을 반환합니다.
  if (day !== undefined && day <= 0) {
    return dates;
  }

  // weekOrder 가 0이나 음수인 경우 빈 배열을 반환합니다.
  if (weekOrder != undefined && weekOrder <= 0) {
    return dates;
  }

  const targetMonth = monthType === 'none' ? monthMap[getMonth(currentDate)] : monthMap[monthType];

  // 시작일의 연도를 기준으로 처리
  let current = new Date(currentDate);
  let year = current.getFullYear();

  while (new Date(year, targetMonth, 1) <= endDate) {
    let dateToAdd: Date | null = null;

    if (weekType !== 'none' && weekOrder !== undefined) {
      // N번째 요일 처리
      const firstDayOfMonth = new Date(year, targetMonth, 1);
      dateToAdd = getNthWeekday(firstDayOfMonth, weekOrder, weekType);
    } else if (day !== undefined) {
      const lastDayOfMonth = getDaysInMonth(year, targetMonth + 1);
      // 말일 처리
      dateToAdd = new Date(year, targetMonth, Math.min(day, lastDayOfMonth));
    } else {
      dateToAdd = new Date(year, targetMonth, currentDate.getDate());
    }

    // 유효한 날짜이고 종료일 이전인 경우에만 추가
    // 현재 날짜와 같은 날짜는 제외
    if (
      dateToAdd &&
      isValidDate(dateToAdd) &&
      dateToAdd <= endDate &&
      dateToAdd.getTime() > currentDate.getTime()
    ) {
      dates.push(dateToAdd);
    }

    // 다음 연도로 이동 (interval 적용)
    year += interval;
  }

  return dates;
}

export function getRemainingDatesOfRepeatedEvent(date: string, repeatInfo: RepeatInfo): Date[] {
  if (date === '') {
    return [];
  }
  const currentDate = new Date(date);
  const endDate = repeatInfo?.endDate ? new Date(repeatInfo?.endDate) : undefined;
  switch (repeatInfo.type) {
    case 'daily':
      return getRemainingDatesByDay(currentDate, endDate, repeatInfo.interval);
    case 'weekly':
      return getRemainingDatesByWeek(
        currentDate,
        endDate,
        repeatInfo.interval,
        repeatInfo.weekType
      );
    case 'monthly':
      return getRemainingDatesByMonth(
        currentDate,
        endDate,
        repeatInfo.interval,
        repeatInfo.weekType,
        repeatInfo.day,
        repeatInfo.weekOrder
      );
    case 'yearly':
      return getRemainingDatesByYear(
        currentDate,
        endDate,
        repeatInfo.interval,
        repeatInfo.monthType,
        repeatInfo.weekType,
        repeatInfo.day,
        repeatInfo.weekOrder
      );
    default:
      return [];
  }
}
