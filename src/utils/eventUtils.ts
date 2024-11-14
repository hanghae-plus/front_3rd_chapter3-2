import { Event, EventForm } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

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

export function generateRepeatEvents(event: Event | EventForm): (Event | EventForm)[] {
  const repeatEvents: (Event | EventForm)[] = [event];
  const { repeat } = event;
  const { type, interval, endDate } = repeat;

  if (type === 'none' || interval <= 0) return repeatEvents;

  const startDate = new Date(`${event.date}T${event.startTime}`);
  const endDateTime = endDate ? new Date(`${endDate}T${event.startTime}`) : new Date(2025, 5, 30);

  const addEvent = (newDate: Date) => {
    if (newDate > endDateTime) return;
    const dateStr = newDate.toISOString().split('T')[0];
    repeatEvents.push({
      ...event,
      date: dateStr,
      repeat: { ...repeat },
    });
  };

  switch (type) {
    case 'daily': {
      const days = Math.ceil((endDateTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      for (let i = 0; i <= days; i += interval) {
        if (i === 0) continue;
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        addEvent(currentDate);
      }
      break;
    }
    case 'weekly': {
      let currentDate = new Date(startDate);
      const weeks = Math.ceil(
        (endDateTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );

      for (let i = 1; i <= weeks; i += interval) {
        currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i * 7);
        addEvent(currentDate);
      }
      break;
    }
    case 'monthly': {
      const monthDiff =
        (endDateTime.getFullYear() - startDate.getFullYear()) * 12 +
        (endDateTime.getMonth() - startDate.getMonth());

      for (let i = 1; i <= monthDiff; i += interval) {
        // 연도와 월을 먼저 계산
        const targetYear = startDate.getFullYear() + Math.floor((startDate.getMonth() + i) / 12);
        const targetMonth = (startDate.getMonth() + i) % 12;

        // 해당 월의 마지막 날짜 확인
        const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

        // 원하는 날짜가 해당 월에 존재하지 않으면 스킵
        if (startDate.getDate() > lastDayOfMonth) {
          continue;
        }

        // 날짜 객체 생성
        const currentDate = new Date(targetYear, targetMonth, startDate.getDate());

        if (currentDate > endDateTime) break;
        addEvent(currentDate);
      }
      break;
    }
    case 'yearly': {
      const years = endDateTime.getFullYear() - startDate.getFullYear();
      const originalMonth = startDate.getMonth();
      const originalDate = startDate.getDate();

      for (let i = 1; i <= years; i += interval) {
        // 윤년 2월 29일 체크를 먼저 수행
        if (originalMonth === 1 && originalDate === 29) {
          const nextYear = startDate.getFullYear() + i;
          const isLeapYear = new Date(nextYear, 1, 29).getMonth() === 1; // 2월이면 윤년
          if (!isLeapYear) {
            continue; // 윤년이 아니면 이벤트 생성하지 않음
          }
        }

        const currentDate = new Date(startDate);
        currentDate.setFullYear(startDate.getFullYear() + i);
        addEvent(currentDate);
      }
      break;
    }
  }

  return repeatEvents;
}
