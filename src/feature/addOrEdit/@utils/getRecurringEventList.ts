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
    recurringDates.push(currentDate.toISOString().split('T')[0]);

    switch (type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + interval * 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
      default:
    }
  }

  return recurringDates;
}
