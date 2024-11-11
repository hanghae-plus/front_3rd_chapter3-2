import { EventForm } from '../../../types';

export const CATEGORIES = ['업무', '개인', '가족', '기타'];

export const NOTIFICATION_OPTIONS = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export const INITIAL_EVENT_FORM: EventForm = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1, endDate: '' },
  notificationTime: 10,
};
