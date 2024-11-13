import dayjs from 'dayjs';

import { Event, EventForm } from '../types';

const formatRepeatType = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

export const getRepeatingEvent = (event: Event | EventForm): Event[] | EventForm[] => {
  if (event.repeat.type === 'none') {
    return [];
  }

  let repeatInterval = event.repeat.interval;
  const repeatType = formatRepeatType[event.repeat.type] as 'day' | 'week' | 'month' | 'year';

  const endDate = event.repeat.endDate || '2025-06-30';
  let currentDate = addDate(event.date, repeatInterval, repeatType);

  const repeatEvents = [];

  while (isBeforeEndDate(currentDate, endDate)) {
    repeatEvents.push({
      ...event,
      date: currentDate,
    });
    repeatInterval += event.repeat.interval;
    currentDate = addDate(event.date, repeatInterval, repeatType);
  }

  return repeatEvents;
};

const addDate = (
  currentDate: string,
  interval: number,
  type: 'day' | 'week' | 'month' | 'year'
) => {
  return dayjs(currentDate).add(interval, type).format('YYYY-MM-DD');
};

const isBeforeEndDate = (targetDate: string, endDate: string) => {
  return dayjs(targetDate).isBefore(dayjs(endDate)) || targetDate === endDate;
};
