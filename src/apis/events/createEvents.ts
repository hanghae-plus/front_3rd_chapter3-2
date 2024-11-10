import { EventForm } from 'src/types';

import { fetchEvents } from './fetchEvents';

export const createEvents = async (eventData: EventForm) => {
  const { ok, data } = await fetchEvents('', { method: 'POST', body: eventData });

  if (!ok) throw new Error('일정 저장 실패');
  return data;
};
