/* eslint-disable no-unused-vars */
import { Event, EventForm } from '../types';

const dateRegexCheck = (date: string) => {
  if (!date) return { valid: false, year: 0, month: 0, day: 0 };

  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const matchDate = date.match(dateRegex);
  if (!matchDate) return { valid: false, year: 0, month: 0, day: 0 };

  const [_, year, month, day] = matchDate.map(Number);
  const dateTime = new Date(year, month - 1, day);
  if (
    dateTime.getFullYear() !== year ||
    dateTime.getMonth() !== month - 1 ||
    dateTime.getDate() !== day
  ) {
    return { valid: false, year, month, day };
  }
  return { valid: true, year, month, day };
};

const timeRegexCheck = (time: string) => {
  if (!time) return { valid: false, hour: 0, minute: 0 };

  const timeRegex = /^(\d{2}):(\d{2})$/;
  const matchTime = time.match(timeRegex);
  if (!matchTime) return { valid: false, hour: 0, minute: 0 };

  const [_, hourStr, minuteStr] = matchTime;
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  // (0 <= hour <= 23, 0 <= minute <= 59)
  if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
    return { valid: true, hour, minute };
  }

  return { valid: false, hour, minute };
};

export function parseDateTime(date: string, time: string) {
  if (!date || !time) return new Date(NaN); // 빈 문자열 처리

  const { valid: dateValid, year, month, day } = dateRegexCheck(date);
  const { valid: timeValid, hour, minute } = timeRegexCheck(time);
  const inValid = !(dateValid && timeValid);
  if (inValid) return new Date(NaN);

  // month는 0부터 시작하므로 -1 필요
  const dateTime = new Date(year, month - 1, day, hour, minute);

  // 유효한 날짜인지 확인
  if (
    dateTime.getFullYear() !== year ||
    dateTime.getMonth() !== month - 1 ||
    dateTime.getDate() !== day ||
    dateTime.getHours() !== hour ||
    dateTime.getMinutes() !== minute
  ) {
    return new Date(NaN);
  }

  return dateTime;
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  if (!isStartTimeEarlier(startTime, endTime)) {
    return {
      start: new Date(NaN),
      end: new Date(NaN),
    };
  }
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]): Event[] {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}

function isStartTimeEarlier(startTime: string, endTime: string): boolean {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // 현재 날짜의 `startTime`과 `endTime`을 기준으로 Date 객체 생성
  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  // 시작 시간이 종료 시간보다 빠른지 확인
  return startDate < endDate;
}
