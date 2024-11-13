import { EventForm, RepeatInfo } from '../types';
import { formatToISODate } from './dateUtils';

// 매일 반복 일정 생성
export const generateDailyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate?: RepeatInfo['endDate']
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (!endDate || currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatToISODate(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + interval); // interval만큼 날짜를 증가시킴
  }

  return events;
};

// 매주 반복 일정 생성
export const generateWeeklyEvents = (eventData: EventForm, interval: number, endDate?: string) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (!endDate || currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatToISODate(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + 7 * interval); // 7일씩 증가 (매주)
  }

  return events;
};
