import { EventForm } from '../types';
import { formatDate, getDaysInMonth } from './dateUtils';

function setDateToOriginalOrLastOfMonth(date: Date, originalDay: number): void {
  const lastDayOfMonth = getDaysInMonth(date.getFullYear(), date.getMonth() + 1);

  date.setDate(originalDay > lastDayOfMonth ? lastDayOfMonth : originalDay);
}

export function generateFutureRepeatEvents(event: EventForm) {
  if (!event.repeat.interval || !event.repeat.type) {
    return [];
  }

  const result: EventForm[] = [];
  const startDate = new Date(event.date);
  const endDate = event.repeat.endDate ? new Date(event.repeat.endDate) : new Date('2025-06-30'); // 과제) 예제 특성상, 2025-06-30까지

  // 원본 이벤트의 일자
  const originalDay = startDate.getDate();
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    switch (event.repeat.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1 * event.repeat.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * event.repeat.interval);
        break;
      case 'monthly':
        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() + 1);

        setDateToOriginalOrLastOfMonth(currentDate, originalDay);
        break;
      case 'yearly':
        currentDate.setDate(1);
        currentDate.setFullYear(currentDate.getFullYear() + 1);

        setDateToOriginalOrLastOfMonth(currentDate, originalDay);
        break;
    }

    if (endDate && currentDate > endDate) {
      break;
    }

    result.push({
      ...event,
      date: formatDate(currentDate),
    });
  }

  return result;
}
