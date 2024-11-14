import { Event, EventForm } from '../types';

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

export function convertEventToRepeatDateRange({ date, repeat: { endDate } }: Event) {
  const start = parseDateTime(date, '00:00');
  const end = endDate ? parseDateTime(endDate, '23:59') : start;
  return { start, end };
}

function addMonthsWithLastDayCheck(date: Date, months: number): Date {
  const newDate = new Date(date);

  // 현재 날짜 저장
  const currentDay = newDate.getDate();

  // 다음 달로 이동
  newDate.setMonth(newDate.getMonth() + months);

  // 이동된 달의 마지막 날 구하기
  const lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();

  // 현재 날짜가 마지막 날보다 크면 마지막 날로 설정
  if (currentDay > lastDayOfMonth) {
    newDate.setDate(lastDayOfMonth);
  }

  return newDate;
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

export function convertRepeatEventToEvents(repeatEvent: Event) {
  const { start, end } = convertEventToRepeatDateRange(repeatEvent);
  const repeatInterval = repeatEvent.repeat.interval;
  const repeatType = repeatEvent.repeat.type;
}
