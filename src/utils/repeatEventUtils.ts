import { Event, EventForm, RepeatType } from '../types';

export const generateRepeatingEvents = (eventData: EventForm): Event[] => {
  const { repeat } = eventData;
  if (!repeat || repeat.type === 'none') {
    throw new Error('Invalid repeat configuration');
  }

  const startDate = new Date(eventData.date);
  let endDate: Date;

  if (repeat.endDate) {
    endDate = new Date(repeat.endDate);
  } else {
    endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1);
  }

  const repeatingEvents: Event[] = [];

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    repeatingEvents.push({
      ...eventData,
      date: currentDate.toISOString().split('T')[0],
      id: '',
    });

    currentDate = getNextRepeatDate(currentDate, repeat.type, repeat.interval);
  }

  return repeatingEvents;
};

const getNextRepeatDate = (currentDate: Date, repeatType: RepeatType, interval: number): Date => {
  const nextDate = new Date(currentDate);
  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7 * interval);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }
  return nextDate;
};
