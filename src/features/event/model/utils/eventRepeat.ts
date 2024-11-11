import { Event, EventForm } from '@entities/event/model/types';

/**
 * @description 윤년인지 확인하는 함수
 * @param year 년도
 * @returns 윤년 여부
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * @description 날짜가 2월 29일인지 확인하는 함수
 * @param date 날짜
 * @returns 2월 29일 여부
 */
function isFebruary29(date: Date): boolean {
  return date.getMonth() === 1 && date.getDate() === 29;
}

/**
 * @description 반복 이벤트의 다음 날짜를 계산하는 함수
 * @param date 기준 날짜
 * @param type 반복 유형
 * @param interval 반복 간격
 * @returns 다음 날짜
 */
function calculateNextDate(date: Date, type: string, interval: number): Date | null {
  const newDate = new Date(date);
  const isStartDateFeb29 = isFebruary29(date);

  switch (type) {
    case 'daily':
      newDate.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      newDate.setDate(date.getDate() + interval * 7);
      break;
    case 'monthly':
      if (isStartDateFeb29) {
        // 2월 29일인 경우 월간 반복에서 제외
        return null;
      } else {
        newDate.setMonth(date.getMonth() + interval);
      }
      break;
    case 'yearly':
      if (isStartDateFeb29) {
        // 2월 29일인 경우, 다음 윤년을 찾음
        let nextYear = date.getFullYear() + interval;

        // 다음 간격의 연도가 윤년이 아니면 그 다음 윤년을 찾음
        while (!isLeapYear(nextYear)) {
          nextYear += interval;
        }

        // 종료일을 넘어가면 null 반환
        const endDate = new Date(date);
        endDate.setFullYear(nextYear);
        if (endDate > new Date(date)) {
          newDate.setFullYear(nextYear);
          newDate.setMonth(1); // 1은 2월을 의미
          newDate.setDate(29);
        } else {
          return null;
        }
      } else {
        newDate.setFullYear(date.getFullYear() + interval);
      }
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
    // 다음 날짜 계산
    const nextDate = calculateNextDate(currentDate, type, interval);

    // nextDate가 null이면 더 이상 반복하지 않음
    if (!nextDate) break;

    // 종료일을 넘어가면 반복 중단
    if (nextDate > endRepeatDate) break;

    events.push(createRepeatedEvent(baseEvent, nextDate));
    currentDate = nextDate;
  }

  return events;
}
