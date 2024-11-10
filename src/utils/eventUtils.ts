import { Event, RepeatType } from '../types';
import { addDays, addMonths, addWeeks, addYears, getWeekDates, isDateInRange } from './dateUtils';

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

// 반복 일정 데이터 생성
// - 반복 유형(매일, 매주, 매월, 매년)
// - 반복 간격
// - 종료일이 있을 경우
//  - 종료일까지 데이터 생성
// - 종료일이 없을 경우
//  - 2050년까지 데이터 생성
export function createRepeatDateRange({
  start,
  type,
  interval,
  end = '2050-12-31',
}: {
  start: string;
  type: RepeatType;
  interval: number;
  end?: string;
}): Date[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates: Date[] = [];

  let nextDate = startDate;

  while (nextDate.getTime() <= endDate.getTime()) {
    dates.push(nextDate);

    if (type === 'daily') {
      nextDate = addDays(nextDate, interval);
    } else if (type === 'weekly') {
      nextDate = addWeeks(nextDate, interval);
    } else if (type === 'monthly') {
      // FIXME: 10/31, 11/30, 12/31, ... 과 같이 반복되는 날짜를 구하기 위해서 시작 날짜를 전달하고 있습니다
      // 더 좋은 방법 찾아서 리팩토링 필요
      nextDate = addMonths(nextDate, interval, startDate.getDate());
    } else if (type === 'yearly') {
      // FIXME: 2024/02/29, 2025/02/28, ..., 2028/02/29를 구하기 위해서 시작 날짜를 전달하고 있습니다
      // 더 좋은 방법 찾아서 리팩토링 필요
      nextDate = addYears(nextDate, interval, startDate.getDate());
    }
  }

  return dates;
}
