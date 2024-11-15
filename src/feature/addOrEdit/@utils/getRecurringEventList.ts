import { RepeatType } from '../../../types';

type RecurringEventList = {
  startDate: string;
  endDate: string;
  interval: number;
  type: RepeatType;
};

export function getRecurringEventList({
  startDate,
  endDate,
  interval,
  type,
}: RecurringEventList): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const recurringDates: string[] = [];

  let currentDate = new Date(start);

  while (currentDate <= end) {
    const targetDay = start.getDate();

    recurringDates.push(currentDate.toLocaleDateString('en-CA'));

    switch (type) {
      case 'daily': {
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      }
      case 'weekly': {
        currentDate.setDate(currentDate.getDate() + interval * 7);
        break;
      }
      case 'monthly': {
        currentDate = getMonthlyNextEventDate(currentDate, interval, targetDay);
        break;
      }
      case 'yearly': {
        currentDate = getYearlyNextEventDate(currentDate, interval);
        break;
      }
      default:
    }
  }

  return recurringDates;
}

const getMonthlyNextEventDate = (date: Date, interval: number, targetDay: number): Date => {
  const originalDay = targetDay;
  let targetMonth = date.getMonth() + interval;
  let targetYear = date.getFullYear();

  if (targetMonth > 11) {
    targetYear += Math.floor(targetMonth / 12);
    targetMonth %= 12;
  }

  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  let adjustedDay = Math.min(originalDay, lastDayOfTargetMonth);

  if (adjustedDay > lastDayOfTargetMonth) {
    adjustedDay = lastDayOfTargetMonth;
  }

  return new Date(targetYear, targetMonth, adjustedDay);
};
const getYearlyNextEventDate = (date: Date, interval: number): Date => {
  const month = date.getMonth();
  const day = date.getDate();
  let targetYear = date.getFullYear() + interval;

  if (month === 1 && day === 29 && !isLeapYear(targetYear)) {
    return new Date(targetYear, 1, 28);
  }
  return new Date(targetYear, month, day);
};

export const isLeapYear = (year: number): boolean => {
  if (year % 400 === 0) return true;

  if (year % 100 === 0) return false;

  return year % 4 === 0;
};
