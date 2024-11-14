import { Event } from '../types.ts';

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

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate: string;
    selectedDays?: string[];
  };
  excludeDates?: string[];
  modifyFrom?: string;
}

export function getRecurringDates(event: CalendarEvent): Date[] {
  if (!event.repeat) return [new Date(event.date)];

  const startDate = new Date(event.date);
  const endDate = new Date(event.repeat.endDate);
  const dates: Date[] = [];

  // 종료일이 시작일보다 이전인 경우
  if (endDate < startDate) return [];

  const addDate = (date: Date) => {
    // 제외된 날짜 체크
    if (event.excludeDates?.includes(date.toISOString().split('T')[0])) {
      return;
    }
    dates.push(new Date(date));
  };

  switch (event.repeat.type) {
    case 'daily': {
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + event.repeat.interval)
      ) {
        addDate(d);
      }
      break;
    }
    case 'weekly': {
      const selectedDays = event.repeat.selectedDays || [getDayCode(startDate.getDay())];
      for (let d = new Date(startDate); d <= endDate; ) {
        // 선택된 요일마다 확인
        selectedDays.forEach((dayCode) => {
          const dayNum = getDayNumber(dayCode);
          const currentDay = d.getDay();
          const daysUntilNext = (dayNum + 7 - currentDay) % 7;
          const nextDate = new Date(d);
          nextDate.setDate(d.getDate() + daysUntilNext);

          if (nextDate <= endDate) {
            addDate(nextDate);
          }
        });
        // 다음 주로 이동
        d.setDate(d.getDate() + 7 * event.repeat.interval);
      }
      break;
    }
    case 'monthly': {
      const dayOfMonth = startDate.getDate();
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // 현재 날짜 추가
        addDate(new Date(currentDate));

        // 다음 달로 이동
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 다음 달의 정보 계산
        const nextMonth = currentMonth + event.repeat.interval;
        const nextYear = currentYear + Math.floor(nextMonth / 12);
        const normalizedMonth = nextMonth % 12;

        // 다음 달의 마지막 날짜 계산
        const lastDayOfNextMonth = new Date(nextYear, normalizedMonth + 1, 0).getDate();

        // 원하는 날짜와 해당 월의 마지막 날짜 중 작은 값 선택
        const targetDay = Math.min(dayOfMonth, lastDayOfNextMonth);

        // 새로운 날짜 설정
        currentDate = new Date(nextYear, normalizedMonth, targetDay);
      }
      break;
    }
    case 'yearly': {
      const month = startDate.getMonth();
      const day = startDate.getDate();

      for (
        let year = startDate.getFullYear();
        year <= endDate.getFullYear();
        year += event.repeat.interval
      ) {
        // 윤년 처리
        const targetDate = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const targetDay = Math.min(day, lastDayOfMonth);

        targetDate.setDate(targetDay);
        if (targetDate <= endDate) {
          addDate(targetDate);
        }
      }
      break;
    }
  }

  // 수정 시작일 이후의 일정 처리
  if (event.modifyFrom) {
    const modifyFromDate = new Date(event.modifyFrom);
    return dates.map((date) => {
      if (date >= modifyFromDate) {
        const modifiedDate = new Date(date);
        // 수정된 종료 시간 적용
        const [hours, minutes] = event.endTime.split(':');
        modifiedDate.setHours(parseInt(hours), parseInt(minutes));
        return modifiedDate;
      }
      return new Date(date); // 새로운 Date 객체 반환
    });
  }

  return dates.map((date) => new Date(date)); // 모든 날짜에 대해 새로운 Date 객체 반환
}

function getDayCode(dayNumber: number): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[dayNumber];
}

function getDayNumber(dayCode: string): number {
  const days = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
  return days[dayCode as keyof typeof days];
}

export function getEventTime(date: Date) {
  return {
    startTime: `${fillZero(date.getHours())}:${fillZero(date.getMinutes())}`,
    endTime: `${fillZero(date.getHours())}:${fillZero(date.getMinutes())}`,
  };
}

export type RepeatType = 'daily' | 'weekly' | 'monthly';
export function getNextRecurringDate(
  baseDate: Date,
  repeatType: RepeatType,
  interval: number
): Date | null {
  // 유효하지 않은 입력값 처리
  if (interval <= 0 || !['daily', 'weekly', 'monthly'].includes(repeatType)) {
    return null;
  }

  const result = new Date(baseDate);

  switch (repeatType) {
    case 'daily':
      result.setDate(baseDate.getDate() + interval);
      break;

    case 'weekly':
      result.setDate(baseDate.getDate() + interval * 7);
      break;

    case 'monthly': {
      const originalDay = baseDate.getDate();
      const originalMonth = baseDate.getMonth();
      const originalYear = baseDate.getFullYear();

      // 먼저 월을 변경
      const targetMonth = originalMonth + interval;
      const targetYear = originalYear + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12;

      // 타겟 월의 마지막 날짜 계산
      const lastDayOfTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();

      // 2월 29일 특별 처리
      if (originalDay === 29 && originalMonth === 1) {
        // 2월 29일인 경우
        if (lastDayOfTargetMonth === 28) {
          // 목표 월이 평년의 2월인 경우
          result.setFullYear(targetYear, normalizedMonth, 28);
          break;
        }
      }

      // 원본이 월말일 경우
      const isLastDayOfMonth =
        originalDay === new Date(originalYear, originalMonth + 1, 0).getDate();

      if (isLastDayOfMonth) {
        // 원본이 월말이었다면 타겟 월의 마지막 날로 설정
        result.setFullYear(targetYear, normalizedMonth, lastDayOfTargetMonth);
      } else {
        // 원본 날짜와 타겟 월의 마지막 날짜 중 작은 값 사용
        const targetDay = Math.min(originalDay, lastDayOfTargetMonth);
        result.setFullYear(targetYear, normalizedMonth, targetDay);
      }
      break;
    }
  }

  return result;
}
