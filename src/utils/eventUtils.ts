import { Event, EventForm, RepeatType } from '../types';
import {
  getWeekDates,
  isDateInRange,
  formatDate,
  isLeapYear,
  getNextDateLastDay,
} from './dateUtils';

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

const getYearlyNextDate = (date: Date, interval: number): Date => {
  const month = date.getMonth();
  const day = date.getDate();
  const targetYear = date.getFullYear() + interval;

  if (month === 1 && day === 29 && !isLeapYear(targetYear)) {
    return new Date(targetYear, 1, 28);
  }
  return new Date(targetYear, month, day);
};

// 주기별 날짜 계산을 위한 함수
const getNextDate = (currentDate: Date, interval: number, repeatType: RepeatType): Date => {
  const newDate = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      newDate.setDate(currentDate.getDate() + interval);
      break;

    case 'weekly':
      newDate.setDate(currentDate.getDate() + interval * 7);
      break;

    case 'monthly':
      if (currentDate.getDate() === 31) {
        return getNextDateLastDay(currentDate, interval, 'month');
      }
      newDate.setMonth(currentDate.getMonth() + interval);
      break;

    case 'yearly':
      return getYearlyNextDate(currentDate, interval);

    default:
      break;
  }

  return newDate;
};

// 반복 이벤트 생성 함수
export const generateRepeatedEvents = (eventData: EventForm): EventForm[] => {
  const { repeat } = eventData;
  const { type: repeatType, interval, endDate } = repeat;

  if (repeatType === 'none') return [eventData];

  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);
  const targetEndDate = endDate ? new Date(endDate) : null;
  const maxOccurrences = 100;
  let occurrences = 0;

  while (!targetEndDate || currentDate <= targetEndDate) {
    if (occurrences >= maxOccurrences) break;

    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });

    currentDate = getNextDate(currentDate, interval, repeatType);
    occurrences++;
  }

  return events;
};
