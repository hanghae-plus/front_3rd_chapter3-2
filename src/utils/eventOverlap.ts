import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from 'date-fns';

import { Event, EventForm, RepeatType } from '../types';

const diff: Record<Exclude<RepeatType, 'none'>, (end: Date, start: Date) => number> = {
  daily: differenceInDays,
  weekly: differenceInWeeks,
  monthly: differenceInMonths,
  yearly: differenceInYears,
};

const add = {
  daily: addDays,
  weekly: addWeeks,
  monthly: addMonths,
  yearly: addYears,
};

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

export function convertEventToRepeatDateRange({ date, repeat: { endDate } }: EventForm) {
  const start = parseDateTime(date, '00:00');
  const end = endDate ? parseDateTime(endDate, '23:59') : start;
  return { start, end };
}

export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}

export function convertRepeatEventToEvents(repeatEvent: EventForm) {
  const { start, end } = convertEventToRepeatDateRange(repeatEvent);
  const repeatInterval = repeatEvent.repeat.interval;
  const repeatType = repeatEvent.repeat.type;

  if (repeatType === 'none') throw new Error('Repeat type is none');

  /** 시작 날짜와 종료 날짜의 차이를 구함 */
  const diffCount = diff[repeatType](end, start);

  const events = Array.from({ length: diffCount + 1 }).map((_, index) => {
    /** 시작 날짜에 반복 간격을 더함 */
    const date = add[repeatType](start, index * repeatInterval);

    return { ...repeatEvent, date: date.toISOString().split('T')[0] };
  });

  return events;
}
