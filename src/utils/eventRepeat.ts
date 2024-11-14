import { Event, EventForm, RepeatInfo } from '../types.ts';
import { formatDate, getDaysInMonth } from './dateUtils.ts';

function adjustNextDailyDate(date: Date, interval: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + interval);
  return newDate;
}

function adjustNextWeeklyDate(date: Date, interval: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + interval * 7);
  return newDate;
}

function adjustNextMonthlyDate(date: Date, targetDay: number, interval: number): Date {
  const newDate = new Date(date);
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() + interval);

  const lastDay = getDaysInMonth(newDate.getFullYear(), newDate.getMonth() + 1);
  newDate.setDate(Math.min(targetDay, lastDay));

  return newDate;
}

function adjustNextYearlyDate(date: Date, interval: number): Date {
  const newDate = new Date(date);
  const currentMonth = newDate.getMonth();
  const currentDay = newDate.getDate();

  newDate.setFullYear(newDate.getFullYear() + interval);
  newDate.setMonth(currentMonth);

  const daysInMonth = getDaysInMonth(newDate.getFullYear(), currentMonth + 1);
  newDate.setDate(Math.min(currentDay, daysInMonth));

  return newDate;
}

function getEndDate(currentEndDate?: string): Date {
  const endDate = new Date(currentEndDate || '2025-06-30');
  const maxEndDate = new Date('2025-06-30');

  if (endDate.getTime() > maxEndDate.getTime()) {
    return maxEndDate;
  }

  return endDate;
}

function generateEventDates(startDate: string, repeat: RepeatInfo): string[] {
  const { type, interval, endDate } = repeat;
  let currentDate = new Date(startDate);
  const end = getEndDate(endDate);

  const eventDates: string[] = [];
  const targetDay = currentDate.getDate();

  while (currentDate <= end) {
    eventDates.push(formatDate(currentDate));

    switch (type) {
      case 'daily': {
        currentDate = adjustNextDailyDate(currentDate, interval);
        break;
      }

      case 'weekly': {
        currentDate = adjustNextWeeklyDate(currentDate, interval);
        break;
      }

      case 'monthly': {
        currentDate = adjustNextMonthlyDate(currentDate, targetDay, interval);
        break;
      }

      case 'yearly': {
        currentDate = adjustNextYearlyDate(currentDate, interval);
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
