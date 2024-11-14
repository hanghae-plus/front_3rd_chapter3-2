import { EventForm } from '../types';

export const generateRepeatingEvents = (baseEvent: EventForm, endDate: string) => {
  const events = [];
  const start = new Date(baseEvent.date);
  const end = new Date(endDate);

  while (start <= end) {
    events.push({
      ...baseEvent,
      date: start.toISOString().split('T')[0],
    });

    switch (baseEvent.repeat.type) {
      case 'daily':
        start.setDate(start.getDate() + baseEvent.repeat.interval);
        break;
      case 'weekly':
        start.setDate(start.getDate() + baseEvent.repeat.interval * 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() + baseEvent.repeat.interval);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() + baseEvent.repeat.interval);
        break;
    }
  }

  return events;
};
