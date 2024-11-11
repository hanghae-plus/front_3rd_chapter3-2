import { Event, EventForm, RepeatInfo } from '../types.ts';
import { formatDate, getDaysInMonth } from './dateUtils.ts';

export function generateEventDates(startDate: string, repeat: RepeatInfo): string[] {
  const { type, interval, endDate } = repeat;
  let currentDate = new Date(startDate);
  const end = new Date(endDate ?? startDate);
  const eventDates: string[] = [];
  const targetDay = currentDate.getDate();

  while (currentDate <= end) {
    eventDates.push(formatDate(currentDate));

    switch (type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;

      case 'weekly':
        currentDate.setDate(currentDate.getDate() + interval * 7);
        break;

      case 'monthly': {
        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() + interval);

        const lastDay = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);

        currentDate.setDate(Math.min(targetDay, lastDay));
        break;
      }

      case 'yearly': {
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();

        currentDate.setFullYear(currentDate.getFullYear() + interval);
        currentDate.setMonth(currentMonth);
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentMonth + 1);

        if (currentDay > daysInMonth) {
          currentDate.setDate(daysInMonth);
        } else {
          currentDate.setDate(currentDay);
        }

        break;
      }

      case 'none':
        return eventDates;
    }
  }

  return eventDates;
}
/**
 * 각 날짜에 대해 `eventData`를 포함한 이벤트 객체 리스트를 생성합니다.
 */
export function createEventList(eventData: Event | EventForm) {
  const eventDates = generateEventDates(eventData.date, eventData.repeat);
  return eventDates.map((date) => ({
    ...eventData,
    date,
  }));
}
