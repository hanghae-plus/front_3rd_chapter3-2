import { getWeekDates, isDateInRange } from './dateUtils';
import { EventFormData, RepeatState } from '../model/types';

import { Event, EventForm, RepeatInfo } from '@/types';

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

export const createEventRepeatState = (repeatFormData: RepeatInfo) => {
  const { type, interval, endDate } = repeatFormData;
  return {
    isRepeating: type !== 'none',
    repeatType: type || 'none',
    repeatInterval: interval || 1,
    repeatEndDate: endDate || '',
  };
};

export const createEventRepeatFormData = (repeatState: RepeatState): RepeatInfo => {
  const { isRepeating, repeatType, repeatInterval, repeatEndDate } = repeatState;
  return {
    type: isRepeating ? (repeatType === 'none' ? 'daily' : repeatType) : 'none',
    interval: repeatInterval,
    endDate: repeatEndDate || undefined,
  };
};

export const createEventFormData = (data: EventFormData): Event | EventForm => {
  const { startTime, endTime, formState, repeatState } = data;
  return {
    ...formState,
    id: data.editingEvent ? data.editingEvent.id : undefined,
    startTime,
    endTime,
    repeat: createEventRepeatFormData(repeatState),
  };
};
