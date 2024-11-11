export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface EventRepeat {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: EventRepeat;
  notificationTime: number;
}
