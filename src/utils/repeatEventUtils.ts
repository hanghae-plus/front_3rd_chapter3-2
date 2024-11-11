import dayjs from 'dayjs';

import { Event, RepeatEvent } from '../types';

export const getRepeatingEvent = (events: Event[]): RepeatEvent[] => {
  const repeatEvent = events.map((event) => ({
    eventId: event.id,
    type: event.repeat.type,
    interval: event.repeat.interval,
    endDate: event.repeat.endDate,
    event: getEventsFromRepeat(event),
  }));
  return repeatEvent;
};

const getEventsFromRepeat = (event: Event) => {
  if (event.repeat.type === 'none') {
    return [];
  }

  let currentDate = dayjs(event.date);
  const endDate = dayjs(event.repeat.endDate || '2100-12-31');
  const formatTerm = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    yearly: 'year',
  };
  const unit = formatTerm[event.repeat.type] as 'day' | 'week' | 'month' | 'year';
  const repeatEvent = [];

  while (dayjs(endDate).diff(currentDate, unit) >= 0 && repeatEvent.length < 40) {
    // eslint-disable-next-line no-unused-vars
    const { id, repeat, date, ...othersRepeatItem } = event;
    repeatEvent.push({
      repeatId: crypto.randomUUID(),
      date: dayjs(currentDate).format('YYYY-MM-DD'),
      ...othersRepeatItem,
    });
    currentDate = dayjs(currentDate).add(event.repeat.interval, unit);
  }

  return repeatEvent;
};
