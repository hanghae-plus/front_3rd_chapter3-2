import { Event, EventForm } from '@/types';

export const checkIsRepeatEvent = (event: Event | EventForm) => {
  return !!event.repeat.id || event.repeat.type !== 'none';
};
