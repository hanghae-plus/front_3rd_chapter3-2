import { Event, EventForm } from '@entities/event/model/types';

/**
 * @description 반복 이벤트의 다음 날짜를 계산하는 함수
 * @param date 기준 날짜
 * @param type 반복 유형
 * @param interval 반복 간격
 * @returns 다음 날짜
 */
function calculateNextDate(date: Date, type: string, interval: number): Date {
  const newDate = new Date(date);

  switch (type) {
    case 'daily':
      newDate.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      newDate.setDate(date.getDate() + interval * 7);
      break;
    case 'monthly':
      newDate.setMonth(date.getMonth() + interval);
      break;
    case 'yearly':
      newDate.setFullYear(date.getFullYear() + interval);
      break;
  }
  return newDate;
}

/**
 * @description 날짜를 'YYYY-MM-DD' 형식으로 변환하는 함수
 * @param date 날짜
 * @returns 문자열 형식의 날짜
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * @description 반복 이벤트를 생성하는 함수
 * @param baseEvent 기준 이벤트
 * @param date 반복 날짜
 * @returns 반복 이벤트
 */
function createRepeatedEvent(baseEvent: Event | EventForm, date: Date): Omit<Event, 'id'> {
  return {
    ...baseEvent,
    date: formatDateToString(date),
  };
}

/**
 * @description 반복 이벤트를 생성하는 함수
 * @param baseEvent 기준 이벤트
 * @returns 반복 이벤트 배열
 */
export function generateRepeatedEvents(baseEvent: Event | EventForm): Omit<Event, 'id'>[] {
  const { repeat } = baseEvent;
  const { type, interval, endDate } = repeat;

  const startDate = new Date(baseEvent.date);
  const endRepeatDate = endDate ? new Date(endDate) : null;
  const events: Omit<Event, 'id'>[] = [baseEvent];

  if (!endRepeatDate) return events;

  let currentDate = startDate;
  const isTrue = true;
  while (isTrue) {
    currentDate = calculateNextDate(currentDate, type, interval);

    if (currentDate > endRepeatDate) break;

    events.push(createRepeatedEvent(baseEvent, currentDate));
  }

  return events;
}
