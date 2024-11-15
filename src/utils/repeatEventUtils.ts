import dayjs from 'dayjs';

import { Event, EventForm } from '../types';

const formatRepeatType = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

export const getRepeatingEvent = (
  event: Event | EventForm,
  exceptDate?: string,
  weeklyDay?: number
): Event[] | EventForm[] => {
  if (event.repeat.type === 'none') {
    return [];
  }

  let repeatInterval = event.repeat.interval;
  const repeatType = formatRepeatType[event.repeat.type] as 'day' | 'week' | 'month' | 'year';

  const startDate = weeklyDay === undefined ? event.date : getNearestDate(event.date, weeklyDay);
  const endDate = event.repeat.endDate || '2025-06-30';
  let currentDate = addDate(startDate, repeatInterval, repeatType);

  const repeatEvents = [];

  while (isBeforeEndDate(currentDate, endDate)) {
    if (currentDate !== exceptDate) {
      repeatEvents.push({
        ...event,
        id: crypto.randomUUID(),
        date: currentDate,
      });
    }

    repeatInterval += event.repeat.interval;
    currentDate = addDate(startDate, repeatInterval, repeatType);
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

const getNearestDate = (date: string, weeklyDay: number) => {
  const targetDate = dayjs(date);
  const currentDay = targetDate.day();

  if (currentDay === weeklyDay) {
    return date;
  }

  const diff = currentDay > weeklyDay ? weeklyDay - currentDay : weeklyDay - currentDay - 7;

  return targetDate.add(diff, 'day').format('YYYY-MM-DD');
};
