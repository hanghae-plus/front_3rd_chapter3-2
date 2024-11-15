import { Event, EventForm, RepeatType } from '../types';
import { formatDate } from './dateUtils';

export function generateRecurringDates(
  startDate: string,
  endDate: string,
  repeatType: RepeatType,
  interval: number
): string[] {
  if (repeatType === 'none') return [startDate];

  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(formatDate(currentDate));

    switch (repeatType) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + interval * 7);
        break;
      case 'monthly':
        // eslint-disable-next-line no-case-declarations
        const currentDay = currentDate.getDate();
        currentDate.setMonth(currentDate.getMonth() + interval);
        // 월말 날짜 처리
        if (currentDate.getDate() !== currentDay) {
          currentDate.setDate(0); // 이전 월의 마지막 날로 설정
        }
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
    }
  }

  return dates;
}

export function createRecurringEvents(eventData: EventForm): Event[] {
  const { repeat, date: startDate } = eventData;

  if (repeat.type === 'none' || !repeat.endDate) {
    return [
      {
        ...eventData,
        id: crypto.randomUUID(),
        isRecurring: false,
      },
    ];
  }

  const dates = generateRecurringDates(startDate, repeat.endDate, repeat.type, repeat.interval);

  return dates.map((date) => ({
    ...eventData,
    id: crypto.randomUUID(),
    date,
    isRecurring: true,
    repeat: {
      ...repeat,
    },
  }));
}

export function updateRecurringEvent(
  event: Event,
  events: Event[],
  updatedData: EventForm
): Event[] {
  const updatedEvent: Event = {
    ...updatedData,
    id: event.id,
    isRecurring: false,
    repeat: { type: 'none', interval: 1 },
  };

  return events.map((e) => (e.id === event.id ? updatedEvent : e));
}
