import { Event } from '../types';
import { formatDate, getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter(({ date, repeat, exceptionList }) => {
    const eventDate = new Date(date);

    if (eventDate > end) return false;

    if (repeat.endDate && !isDateInRange(new Date(repeat.endDate), start, end)) return false;

    if (repeat.type === 'none') return isDateInRange(eventDate, start, end);

    switch (repeat.type) {
      case 'yearly':
        return isFilterYearly(eventDate, start, end, exceptionList, repeat.interval);
      case 'monthly':
        return isFilterMonthly(eventDate, start, end, exceptionList, repeat.interval);
      case 'weekly':
        return isFilterWeekly(eventDate, start, end, exceptionList, repeat.interval);
      case 'daily':
        return isFilterDaily(eventDate, start, end, exceptionList, repeat.interval);
      default:
        return isDateInRange(eventDate, start, end);
    }
  });
}

function isFilterYearly(
  eventDate: Date,
  start: Date,
  end: Date,
  exceptionList: string[],
  interval = 1
) {
  const [y, m, d] = [eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate()];
  const [startY, startM] = [start.getFullYear(), start.getMonth() + 1];
  if ((startY - y) % interval !== 0) return false;
  if (m !== startM) return false;

  const lastDayInEvent = new Date(y, m, 0).getDate();
  const lastDayInCurrentDate = new Date(startY, startM, 0);
  const isLastDayInMonth = lastDayInEvent === d;

  // 말일 이벤트면 말일 날짜로 계산
  const targetDate = isLastDayInMonth
    ? lastDayInCurrentDate
    : new Date(startY, start.getMonth(), d);

  if (exceptionList.includes(formatDate(targetDate))) return false;

  return isDateInRange(targetDate, start, end);
}

function isFilterMonthly(
  eventDate: Date,
  start: Date,
  end: Date,
  exceptionList: string[],
  interval = 1
) {
  const [y, m, d] = [eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate()];
  const [startY, startM] = [start.getFullYear(), start.getMonth() + 1];

  if (startM % interval !== 0) return false;

  const lastDayInEvent = new Date(y, m, 0).getDate();
  const lastDayInCurrentDate = new Date(startY, startM, 0);
  const isLastDayInMonth = lastDayInEvent === d;

  // 말일 이벤트면 말일 날짜로 계산
  const targetDate = isLastDayInMonth ? lastDayInCurrentDate : eventDate;
  if (exceptionList.includes(formatDate(targetDate))) return false;

  return isDateInRange(targetDate, start, end);
}
function isFilterWeekly(
  eventDate: Date,
  start: Date,
  end: Date,
  exceptionList: string[],
  interval = 1
) {
  const dayOfWeek = eventDate.getDay();

  let current = new Date(start);
  while (current <= end) {
    if (
      current.getDay() === dayOfWeek &&
      getDateDifferenceInDays(eventDate, current) % (interval * 7) === 0
    ) {
      if (exceptionList.includes(formatDate(current))) return false;
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
}

function isFilterDaily(
  eventDate: Date,
  start: Date,
  end: Date,
  exceptionList: string[],
  interval = 1
) {
  let current = new Date(start);
  while (current <= end) {
    if (
      getDateDifferenceInDays(eventDate, current) % interval === 0 &&
      isDateInRange(current, start, end) &&
      !exceptionList.includes(formatDate(current))
    ) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
}

function getDateDifferenceInDays(start: Date, end: Date) {
  const timeDifference = end.getTime() - start.getTime();
  return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
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
  monthEnd.setHours(23);
  monthEnd.setMinutes(59);
  monthEnd.setSeconds(59);
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
