import { Event, EventForm } from 'src/types';

export const createEvent = (overrides: Partial<Event> = {}): Event | EventForm => ({
  id: '1',
  title: '기본 제목',
  date: '2024-10-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '기본 설명',
  location: '기본 위치',
  category: '업무',
  repeat: { type: 'none', interval: 0, endDate: '' },
  notificationTime: 10,
  ...overrides,
});
