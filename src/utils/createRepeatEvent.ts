import { RepeatType } from '../types';
import { Event } from '../types';

export function createRepeatEvent(event: Event, maxOccurrences?: number): string[] {
  const { date: startDateStr, repeat: { interval, type: repeatType, endDate: endDateStr } } = event;
  const eventDates: string[] = [];
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

  while (currentEventDate <= endEventDate && (maxOccurrences === undefined || occurrences < maxOccurrences)) {
    eventDates.push(currentEventDate.toISOString().split('T')[0]);
    adjustDateByInterval(currentEventDate, repeatType, interval);
    occurrences++;
  }

  return eventDates;
}