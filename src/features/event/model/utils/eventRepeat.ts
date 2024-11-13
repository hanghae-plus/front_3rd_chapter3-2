import { Event, EventForm, RepeatDepth, RepeatType } from '@entities/event/model/types';
import {
  calculateDailyNext,
  calculateMonthlyNext,
  calculateWeeklyNext,
  calculateYearlyNext,
  formatDateToString,
} from '@features/event/model/utils';

/**
 * @description 반복 이벤트를 생성하는 함수
 */
export function createRepeatedEvent(baseEvent: Event | EventForm, date: Date): Omit<Event, 'id'> {
  return {
    ...baseEvent,
    date: formatDateToString(date),
  };
}

/**
 * @description 반복 이벤트 목록을 생성하는 함수
 */
export function generateRepeatedEvents(baseEvent: Event | EventForm): Omit<Event, 'id'>[] {
  const { repeat } = baseEvent;
  if (!repeat) return [baseEvent];

  const { type, interval, endDate, depth } = repeat;
  const startDate = new Date(baseEvent.date);
  const endRepeatDate = endDate ? new Date(endDate) : null;
  const events: Omit<Event, 'id'>[] = [baseEvent];

  if (!endRepeatDate) return events;

  let currentDate = startDate;

  while (currentDate < endRepeatDate) {
    // 이 부분이 변경되어야 함
    let nextDate = calculateNextDate(currentDate, type, interval, depth);

    // null이면 다음 년도로 이동만 하고 계속 진행
    if (!nextDate) {
      currentDate.setFullYear(currentDate.getFullYear() + interval);
      continue;
    }

    if (nextDate > endRepeatDate) break;

    events.push(createRepeatedEvent(baseEvent, nextDate));
    currentDate = nextDate;
  }

  return events;
}

/**
 * @description 다음 반복 날짜를 계산하는 함수
 */
export function calculateNextDate(
  date: Date,
  type: RepeatType,
  interval: number,
  depth?: RepeatDepth
): Date | null {
  const calculators = {
    daily: () => calculateDailyNext(date, interval),
    weekly: () => calculateWeeklyNext(date, interval),
    monthly: () => calculateMonthlyNext(date, interval, depth),
    yearly: () => calculateYearlyNext(date, interval, depth),
  };

  return calculators[type as keyof typeof calculators]?.() || null;
}
