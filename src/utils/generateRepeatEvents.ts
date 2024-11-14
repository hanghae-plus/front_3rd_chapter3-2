import { EventForm } from '../types';
import { formatDate } from './dateUtils';

// ! TEST CASE
export const generateRepeatEvents = (eventData: EventForm): EventForm[] => {
  const events: EventForm[] = [];
  const maxEndDate = new Date('2025-06-30');
  const startDate = new Date(eventData.date);
  const endDate = eventData.repeat.endDate ? new Date(eventData.repeat.endDate) : maxEndDate;

  const originalDay = startDate.getDate();
  const originalMonth = startDate.getMonth();

  let currentDate = new Date(startDate);

  if (eventData.repeat.type === 'none' || eventData.repeat.interval === 0) {
    return [eventData];
  }

  while (currentDate <= endDate) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });

    switch (eventData.repeat.type) {
      case 'daily':
        currentDate = new Date(
          currentDate.getTime() + eventData.repeat.interval * 24 * 60 * 60 * 1000
        );
        break;

      case 'weekly':
        currentDate = new Date(
          currentDate.getTime() + eventData.repeat.interval * 7 * 24 * 60 * 60 * 1000
        );
        break;

      case 'monthly': {
        currentDate.setMonth(currentDate.getMonth() + eventData.repeat.interval);
        currentDate.setDate(originalDay);

        if (currentDate.getDate() !== originalDay) {
          currentDate.setDate(1);
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;
      }

      case 'yearly': {
        if (originalMonth === 1 && originalDay === 29) {
          currentDate.setFullYear(currentDate.getFullYear() + 4);
        } else {
          currentDate.setFullYear(currentDate.getFullYear() + eventData.repeat.interval);
        }

        currentDate.setMonth(originalMonth);
        currentDate.setDate(originalDay);

        if (currentDate.getMonth() !== originalMonth || currentDate.getDate() !== originalDay) {
          currentDate.setMonth(0);
          currentDate.setDate(1);
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }

        break;
      }
    }
  }

  return events;
};
