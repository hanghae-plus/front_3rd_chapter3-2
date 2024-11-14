import { Event } from '../types.ts';
import { formatDate } from './dateUtils.ts';

function addIntervalToDate(type: 'monthly' | 'yearly', currentDate: Date, interval: number) {
  const date = currentDate.getDate();
  let nextMonth = currentDate.getMonth();
  let nextYear = currentDate.getFullYear();

  if (type === 'monthly') {
    nextMonth += interval;
    if (nextMonth > 11) {
      nextYear += Math.floor(nextMonth / 12);
      nextMonth %= 12;
    }
  } else if (type === 'yearly') {
    nextYear += interval;
  }

  return {
    nextYear,
    nextMonth,
    date,
  };
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function calculateNextDate(type: 'monthly' | 'yearly', currentDate: Date, interval: number) {
  const { nextYear, nextMonth, date } = addIntervalToDate(type, currentDate, interval);
  const endDateOfMonth = getLastDayOfMonth(nextYear, nextMonth);

  return new Date(nextYear, nextMonth, Math.min(date, endDateOfMonth));
}

function getNextEventDate(event: Event, currentDate: Date) {
  const { repeat } = event;

  switch (repeat.type) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + repeat.interval);
      return currentDate;

    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * repeat.interval);
      return currentDate;

    case 'monthly':
      return calculateNextDate('monthly', currentDate, repeat.interval);

    case 'yearly':
      return calculateNextDate('yearly', currentDate, repeat.interval);

    default:
      return null;
  }
}

const END_DATE = '2025-06-30';

export function generateRepeatedEvents(event: Event) {
  const events: Event[] = [];
  const endDate = new Date(event.repeat.endDate || END_DATE);
  let currentDate: Date | null = new Date(event.date);

  while (currentDate && currentDate <= endDate) {
    events.push({ ...event, date: formatDate(currentDate) });

    currentDate = getNextEventDate(event, currentDate);
  }

  return events;
}
