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
export function isRecurringEventEnded(event: Event, currentDate: Date = new Date()): boolean {
  // 반복 설정이 없는 경우
  if (!event.repeat) {
    return true;
  }

  const { endType } = event.repeat;

  // 종료 타입에 따른 처리
  switch (endType) {
    case 'date': {
      // 종료 날짜가 없거나 유효하지 않은 형식인 경우
      if (!event.repeat.endDate || isNaN(new Date(event.repeat.endDate).getTime())) {
        return true;
      }

      const endDate = new Date(event.repeat.endDate);
      return currentDate > endDate;
    }

    case 'count': {
      // 종료 횟수나 현재 횟수가 없는 경우
      if (!event.repeat.endCount || !event.repeat.currentCount) {
        return true;
      }

      return event.repeat.currentCount >= event.repeat.endCount;
    }

    case 'never': {
      // 예제 특성상 2025-06-30까지만 허용
      const maxDate = new Date('2025-06-30');
      return currentDate > maxDate;
    }

    default:
      // 잘못된 종료 타입인 경우
      return true;
  }
}

import { Event } from '../types';

export function convertToSingleEvent(originalEvent: Event, updatedEvent: Event): Event | null {
  // 원본 이벤트가 없는 경우
  if (!originalEvent) {
    return null;
  }

  // 수정할 이벤트가 없는 경우, 원본에서 repeat만 제거
  if (!updatedEvent) {
    const eventWithoutRepeat = { ...originalEvent };
    delete eventWithoutRepeat.repeat;
    return eventWithoutRepeat;
  }

  // ID가 다른 경우
  if (originalEvent.id !== updatedEvent.id) {
    return null;
  }

  // 수정된 내용과 원본 내용을 병합하고 repeat 속성 제거
  const result: Event = {
    ...originalEvent, // 원본 데이터를 기본으로
    ...updatedEvent, // 수정된 데이터로 덮어쓰기
    repeat: undefined, // repeat 속성 제거
  };

  return result;
}
