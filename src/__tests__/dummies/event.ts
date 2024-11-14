import { EventForm } from '../../types';

export const basicEvent: EventForm = {
  title: '기본 이벤트',
  date: '2024-10-16',
  startTime: '09:00',
  endTime: '10:00',
  description: '기본 설명',
  location: '기본 장소',
  category: '기타',
  repeat: { type: 'monthly', interval: 3 },
  notificationTime: 10,
};
