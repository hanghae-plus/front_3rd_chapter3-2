import { Event } from 'src/types';

import { fetchEvents } from './fetchEvents';

export const updateEvents = async (eventData: Event) => {
  const { id } = eventData as Event;
  const { ok, data } = await fetchEvents(`/${id}`, { method: 'PUT', body: eventData });
  if (!ok) throw new Error('일정 저장 실패');
  return data;
};
