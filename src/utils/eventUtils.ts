import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';
import { formatDate, isLeapYear } from '../features/calendar/lib/dateUtils.ts';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

export function generateRecurringEvents(
  startDate: string,
  interval: number,
  repeatType: string,
  endDate: string
): string[] {
  const dates = [];
  let currentDate = new Date(startDate);
  const targetEndDate = new Date(endDate);

  const targetDay = currentDate.getDate();

  const getMonthlyNextEventDate = (date: Date, interval: number): Date => {
    const originalDay = targetDay;
    let targetMonth = date.getMonth() + interval;
    let targetYear = date.getFullYear();

    if (targetMonth > 11) {
      targetYear += Math.floor(targetMonth / 12);
      targetMonth %= 12;
    }

    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const adjustedDay = Math.min(originalDay, lastDayOfTargetMonth);

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

  while (currentDate <= targetEndDate) {
    dates.push(formatDate(currentDate));

    switch (repeatType) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;

      case 'weekly':
        currentDate.setDate(currentDate.getDate() + interval * 7);
        break;

      case 'monthly':
        currentDate = getMonthlyNextEventDate(currentDate, interval);
        break;

      case 'yearly':
        currentDate = getYearlyNextEventDate(currentDate, interval);
        break;

      default:
        return dates;
    }
  }

  return dates;
}
