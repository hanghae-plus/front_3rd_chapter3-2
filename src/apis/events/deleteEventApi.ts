import { fetchEvents } from './fetchEvents';

export const deleteEventApi = async (id: string) => {
  const { ok } = await fetchEvents(`/${id}`, { method: 'DELETE' });
  if (!ok) throw new Error('일정 삭제 실패');
};
