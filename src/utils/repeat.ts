import { REPEAT_END_DATE } from '../shared/constants';
import { Event } from '../types';
import { formatDate, isLeapYear } from './dateUtils';

const getMonthlyNextDate = (date: Date, interval: number): Date => {
  const nextDate = new Date(date);
  const originalDay = date.getDate();
  const isLastDayOfMonth =
    originalDay === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  let targetMonth = date.getMonth() + interval;
  let targetYear = date.getFullYear();

  while (targetMonth > 11) {
    targetYear++;
    targetMonth -= 12;
  }

  nextDate.setDate(1);
  nextDate.setFullYear(targetYear);
  nextDate.setMonth(targetMonth);

  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  if (isLastDayOfMonth || originalDay === 31) {
    nextDate.setDate(lastDayOfMonth);
  } else {
    nextDate.setDate(Math.min(originalDay, lastDayOfMonth));
  }

  return nextDate;
};

const getYearlyNextDate = (date: Date, interval: number): Date => {
  const nextDate = new Date(date);
  const isLeapDayEvent = date.getMonth() === 1 && date.getDate() === 29;

  if (isLeapDayEvent) {
    let targetYear = date.getFullYear();
    let count = 0;

    while (count < interval) {
      targetYear += interval;
      if (isLeapYear(targetYear)) {
        count++;
      }
    }
    nextDate.setFullYear(targetYear);
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + interval);
  }

  return nextDate;
};

export const getNextDate = (event: Event, currentDate: Date): Date | null => {
  const { type, interval } = event.repeat;
  const nextDate = new Date(currentDate);

  switch (type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      return nextDate;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7 * interval);
      return nextDate;
    case 'monthly':
      return getMonthlyNextDate(nextDate, interval);
    case 'yearly':
      return getYearlyNextDate(nextDate, interval);
    default:
      return null;
  }
};

export const getRepeatEvents = (event: Event): Event[] => {
  const { repeat } = event;
  const newEvents = [];
  const endDate = new Date(repeat.endDate || REPEAT_END_DATE);
  let currentDate = new Date(event.date);

  while (currentDate && currentDate <= endDate) {
    newEvents.push({ ...event, date: formatDate(currentDate) });
    const nextDate = getNextDate(event, currentDate);
    if (!nextDate) break;
    currentDate = nextDate;
  }

  return newEvents;
};
