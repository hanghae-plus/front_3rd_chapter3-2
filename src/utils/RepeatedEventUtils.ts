import { Event, EventForm, RepeatInfo } from '../types';
import { formatDate, getNextDateLastDay } from './dateUtils';

const DEFAULT_END_DATE = '2025-06-30';

// 매일 반복 일정 생성
const generateDailyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + interval); // interval만큼 날짜를 증가시킴
  }

  return events;
};

// 매주 반복 일정 생성
const generateWeeklyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + 7 * interval); // 7일씩 증가 (매주)
  }

  return events;
};

// 매월 반복 일정 생성
const generateMonthlyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });

    // 반복일정의 날짜가 31일 이라면, 다음 달의 마지막 날짜로 설정
    if (new Date(eventData.date).getDate() === 31) {
      currentDate = getNextDateLastDay(currentDate, interval, 'month');
    } else {
      currentDate.setMonth(currentDate.getMonth() + interval); // interval만큼 월을 증가
    }
  }

  return events;
};

// 매년 반복 일정 생성
const generateYearlyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate: RepeatInfo['endDate'] = DEFAULT_END_DATE
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });

    // 반복일정의 날짜가 윤년 29일 이라면, 다음 해의 달의 마지막 날짜로 설정
    if (new Date(eventData.date).getDate() === 29) {
      currentDate = getNextDateLastDay(currentDate, interval, 'year');
    } else {
      currentDate.setFullYear(currentDate.getFullYear() + interval); // interval만큼 연도 증가
    }
  }

  return events;
};

export const generateRepeatedEvents = (eventData: Event | EventForm): EventForm[] => {
  const { repeat } = eventData;
  const { type, interval, endDate } = repeat;

  switch (type) {
    case 'daily':
      return generateDailyEvents(eventData, interval, endDate);

    case 'weekly':
      return generateWeeklyEvents(eventData, interval, endDate);

    case 'monthly':
      return generateMonthlyEvents(eventData, interval, endDate);

    case 'yearly':
      return generateYearlyEvents(eventData, interval, endDate);

    default:
      return [];
  }
};
