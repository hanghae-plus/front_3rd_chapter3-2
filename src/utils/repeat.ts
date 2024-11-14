import { REPEAT_END_DATE } from '../shared/constants';
import { Event } from '../types';
import { formatDate, isLeapYear } from './dateUtils';

const getMonthlyNextDate = (date: Date, interval: number): Date => {
  let { month, year } = { month: date.getMonth(), year: date.getFullYear() };
  month += interval;
  if (month > 11) {
    year++;
    month -= 12;
  }
  const day = date.getDate();
  let targetDate = new Date(year, month, day);
  while (targetDate.getMonth() !== month) {
    month += interval;
    if (month > 11) {
      year++;
      month -= 12;
    }
    targetDate = new Date(year, month, day);
  }
  return targetDate;
};

const getYearlyNextDate = (date: Date, interval: number): Date => {
  if (date.getMonth() === 1 && date.getDate() === 29) {
    let newYear = date.getFullYear() + interval * 4;
    if (!isLeapYear(newYear)) newYear += 4;
    date.setFullYear(newYear);
  } else {
    date.setFullYear(date.getFullYear() + interval);
  }
  return date;
};

export const getNextDate = (event: Event, currentDate: Date): Date | null => {
  const { type, interval } = event.repeat;
  switch (type) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + interval);
      return currentDate;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * interval);
      return currentDate;
    case 'monthly':
      return getMonthlyNextDate(currentDate, interval);
    case 'yearly':
      return getYearlyNextDate(currentDate, interval);
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
    if (nextDate) {
      currentDate = nextDate;
    } else {
      break;
    }
  }
  return newEvents;
};
