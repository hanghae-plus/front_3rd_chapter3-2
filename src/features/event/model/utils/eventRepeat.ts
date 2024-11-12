import { Event, EventForm } from '@entities/event/model/types';
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
  const { type, interval, endDate } = repeat;

  const startDate = new Date(baseEvent.date);
  const endRepeatDate = endDate ? new Date(endDate) : null;
  const events: Omit<Event, 'id'>[] = [baseEvent];

  if (!endRepeatDate) return events;

  let currentDate = startDate;

  let isTrue = true;
  while (isTrue) {
    const nextDate = calculateNextDate(currentDate, type, interval);

    if (!nextDate || nextDate > endRepeatDate) break;

    events.push(createRepeatedEvent(baseEvent, nextDate));
    currentDate = nextDate;
  }

  return events;
}

export function calculateNextDate(date: Date, type: string, interval: number): Date | null {
  const calculators = {
    daily: () => calculateDailyNext(date, interval),
    weekly: () => calculateWeeklyNext(date, interval),
    monthly: () => calculateMonthlyNext(date, interval),
    yearly: () => calculateYearlyNext(date, interval),
  };

  return calculators[type as keyof typeof calculators]?.() || null;
}
