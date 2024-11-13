import { EventForm, RepeatInfo } from '../types';
import { formatToISODate } from './dateUtils';

const DEFAULT_END_DATE = '2025-06-30';

// 매일 반복 일정 생성
export const generateDailyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatToISODate(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + interval); // interval만큼 날짜를 증가시킴
  }

  return events;
};

// 매주 반복 일정 생성
export const generateWeeklyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatToISODate(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + 7 * interval); // 7일씩 증가 (매주)
  }

  return events;
};

// 매월 반복 일정 생성
export const generateMonthlyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatToISODate(currentDate),
    });
    currentDate.setMonth(currentDate.getMonth() + interval); // interval만큼 월을 증가시킴
  }

  return events;
};

// 매년 반복 일정 생성
export const generateYearlyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatToISODate(currentDate),
    });
    currentDate.setFullYear(currentDate.getFullYear() + interval); // interval만큼 연도를 증가시킴
  }

  return events;
};
