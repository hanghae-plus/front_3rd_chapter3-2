import { Event } from '../types.ts';

function adjustEndOfMonthDate(date: Date) {
  if (date.getDate() <= 29) {
    const lastDateOfMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const isInValidDate = date.getDate() < lastDateOfMonth;

    return isInValidDate
      ? new Date(date.getFullYear(), date.getMonth() - 1, lastDateOfMonth)
      : date;
  }

  return date;
}

function getNextEventDate(event: Event) {
  const currentDate = new Date(event.date);

  const { repeat } = event;

  switch (repeat.type) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + repeat.interval);
      return currentDate;

    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * repeat.interval);
      return currentDate;

    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + repeat.interval);
      return adjustEndOfMonthDate(currentDate);

    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + repeat.interval);
      return adjustEndOfMonthDate(currentDate);

    default:
      return null;
  }
}

export function generateRepeatedEvents(event: Event) {
  return getNextEventDate(event);
}
