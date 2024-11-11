import { RepeatType } from '../types';
import { Event } from '../types';

export function createRepeatEvent(event: Event): string[] {
  const { date: startDateStr, repeat: { interval, type: repeatType, endDate: endDateStr } } = event;
  const eventDates: string[] = [];
  let currentEventDate = new Date(startDateStr);
  const endEventDate = new Date(endDateStr);
  // 타입 에러 안나게.. 이유는 나중에 잡아보도록 하자 ..
  // const endEventDate = new Date(endDateStr ?? '');

  const adjustDateByInterval = (date: Date, type: RepeatType, interval: number) => {
    switch (type) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + interval * 7);
        break;
      case 'monthly':
        const initialDay = date.getDate();
        date.setMonth(date.getMonth() + interval);
        if (date.getDate() !== initialDay) {
          date.setDate(0);
        }
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
    }
  };

  while (currentEventDate <= endEventDate) {
    eventDates.push(currentEventDate.toISOString().split('T')[0]);
    adjustDateByInterval(currentEventDate, repeatType, interval);
  }

  return eventDates;
}