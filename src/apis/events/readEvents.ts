import { fetchEvents } from './fetchEvents';

export const readEvents = async () => {
  const { ok, data } = await fetchEvents();

  if (!ok) throw new Error('이벤트 로딩 실패');

  return data.events;
};
