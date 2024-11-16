import { Event, EventForm, RepeatInfo } from '../types';
import {
  formatDate,
  getRemainingDatesOfRepeatedEvent,
  getWeekDates,
  isDateInRange,
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

export function generateRepeatedEvents(event: Event | EventForm): EventForm[] {
  const dates: Date[] = getRemainingDatesOfRepeatedEvent(event.date, event.repeat);
  const { title, startTime, endTime, description, location, category, repeat, notificationTime } =
    event;
  const events = dates.map((date) => ({
    title,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat,
    notificationTime,
    date: formatDate(date),
  }));
  return events;
}

export function hasChangeInRepeatInfo(repeatInfo1: RepeatInfo, repeatInfo2: RepeatInfo) {
  const key1 = Object.keys(repeatInfo1);
  const key2 = Object.keys(repeatInfo2);
  if (key1.length !== key2.length) return true;

  const keys = new Set([...key1, ...key2]);
  for (const key of keys) {
    if (repeatInfo1[key as keyof RepeatInfo] !== repeatInfo2[key as keyof RepeatInfo]) {
      return true;
    }
  }
  return false;
}
