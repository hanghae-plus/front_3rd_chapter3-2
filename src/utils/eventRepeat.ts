// 반복 일정 관련 Utils

import { DAYS_BY_REPEAT_TYPE } from '../constants';
import { Event, EventForm } from '../types';
import { formatDate } from './dateUtils';

function getRepeatDates(event: Event | EventForm, defaultDay: number) {
  const { date: startDate, repeat } = event;
  const { endDate, interval } = repeat;

  const dates = [];

  const targetEndDate = new Date(endDate ?? '2025-06-30');
  let targetStartDate = new Date(startDate);

  while (targetStartDate.getTime() <= targetEndDate.getTime()) {
    dates.push(formatDate(targetStartDate));
    targetStartDate.setDate(targetStartDate.getDate() + defaultDay * interval);
  }

  return dates;
}

export function createRepeatEvent(event: Event | EventForm) {
  const dayType = event.repeat.type.toUpperCase() as keyof typeof DAYS_BY_REPEAT_TYPE;
  const defaultDay = DAYS_BY_REPEAT_TYPE[dayType];

  if (!defaultDay) {
    throw new Error('잘못된 반복 유형입니다.');
  }

  const targetDates = getRepeatDates(event, defaultDay);
  const repeatEndDate = targetDates[targetDates.length - 1];

  return targetDates.map((date) => ({
    ...event,
    repeat: { ...event.repeat, endDate: repeatEndDate },
    date,
  }));
}

export function isRepeatEvent(eventData: Event | EventForm) {
  return eventData.repeat.type !== 'none';
}
