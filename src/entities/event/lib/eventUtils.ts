import { Event } from '../model/types';

export const findOverlappingEvents = (existingEvents: Event[], newEvet: Event): Event[] => {
  return existingEvents.filter((event) => {
    if (event.date !== newEvet.date) return false;

    const newEventsStart = new Date(newEvet.startTime).getTime();
    const newEventsEnd = new Date(newEvet.endTime).getTime();
    const existingEventsStart = new Date(event.startTime).getTime();
    const existingEventsEnd = new Date(event.endTime).getTime();

    return (
      (newEventsStart >= existingEventsStart && newEventsStart <= existingEventsEnd) ||
      (newEventsEnd >= existingEventsStart && newEventsEnd <= existingEventsEnd) ||
      (newEventsStart <= existingEventsStart && newEventsEnd >= existingEventsEnd)
    );
  });
};
