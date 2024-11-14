import { Event } from '../types';
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

interface EventDisplay {
  icon: string | null;
  badge: string | null;
  className: string;
}

export function getRecurringEventDisplay(event: Event): EventDisplay {
  // 반복 설정이 없는 경우 기본값 반환
  if (!event.repeat) {
    return {
      icon: null,
      badge: null,
      className: '',
    };
  }

  const { type, interval } = event.repeat;

  // 잘못된 반복 타입 처리
  if (!['daily', 'weekly', 'monthly'].includes(type)) {
    return {
      icon: null,
      badge: null,
      className: '',
    };
  }

  // 반복 타입별 기본 설정
  const typeConfig = {
    daily: {
      icon: 'repeat-daily',
      badgeUnit: '일',
      className: 'recurring-daily',
    },
    weekly: {
      icon: 'repeat-weekly',
      badgeUnit: '주',
      className: 'recurring-weekly',
    },
    monthly: {
      icon: 'repeat-monthly',
      badgeUnit: '월',
      className: 'recurring-monthly',
    },
  };

  // 반복 간격에 따른 뱃지 텍스트 생성
  let badge: string;
  if (interval === 1) {
    badge = `매${typeConfig[type].badgeUnit}`;
  } else {
    badge = `${interval}${typeConfig[type].badgeUnit}마다`;
  }

  // 기본 클래스명
  let className = `recurring-event ${typeConfig[type].className}`;

  // 무한 반복 일정인 경우 클래스 추가
  if (event.repeat.endDate === null) {
    className += ' recurring-infinite';
  }

  return {
    icon: typeConfig[type].icon,
    badge,
    className: className.trim(),
  };
}
