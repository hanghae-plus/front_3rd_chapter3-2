/* eslint-disable no-case-declarations */
import { RepeatType, Event } from '../types';
import { formatDate } from './dateUtils';

export function createRepeatEvent(event: Event, maxOccurrences?: number): Event[] {
  const {
    date: startDateStr,
    repeat: { interval, type: repeatType, endDate: endDateStr },
  } = event;
  const eventInstances: Event[] = [];
  let currentEventDate = new Date(startDateStr);
  const defaultEndDate = new Date('2025-06-30');
  const endEventDate = endDateStr ? new Date(endDateStr) : defaultEndDate;
  let occurrences = 0;

  const adjustDateByInterval = (date: Date, type: RepeatType, interval: number) => {
    switch (type) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + interval * 7);
        break;
      case 'monthly':
        const initialDay = date.getDate();
        date.setMonth(date.getMonth() + interval);
        if (date.getDate() !== initialDay) {
          date.setDate(0);
        }
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
    }
  };

  while (
    currentEventDate <= endEventDate &&
    (maxOccurrences === undefined || occurrences < maxOccurrences)
  ) {
    eventInstances.push({
      ...event,
      date: formatDate(currentEventDate),
    });
    adjustDateByInterval(currentEventDate, repeatType, interval);
    occurrences++;
  }

  return eventInstances;
}
