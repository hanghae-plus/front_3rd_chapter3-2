import dayjs from 'dayjs';

import { Event } from '../types';

const formatRepeatType = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

export const getRepeatingEvent = (events: Event[]): Array<Event[]> => {
  const eventsWithRepeat = events.filter((event) => event.repeat.type !== 'none');
  const repeatingEvents = eventsWithRepeat.map((event) => getRepeatingUntilEnd(event));

  return repeatingEvents;
};

const getRepeatingUntilEnd = (event: Event) => {
  if (event.repeat.type === 'none') {
    return [];
  }

  let currentDate = event.date;
  const endDate = event.repeat.endDate || '2025-06-30';
  let repeatInterval = event.repeat.interval;
  const repeatType = formatRepeatType[event.repeat.type] as 'day' | 'week' | 'month' | 'year';
  const repeatEvents = [];

  while (isBeforeEndDate(currentDate, endDate)) {
    repeatEvents.push({
      ...event,
      date: currentDate,
    });
    currentDate = dayjs(event.date).add(repeatInterval, repeatType).format('YYYY-MM-DD');
    repeatInterval += event.repeat.interval;
  }

  return repeatEvents;
};

const isBeforeEndDate = (targetDate: string, endDate: string) => {
  return dayjs(targetDate).isBefore(dayjs(endDate)) || targetDate === endDate;
};
