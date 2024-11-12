export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

export type RepeatEndCondition = 'date' | 'count' | 'never';

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
  isRepeating: boolean;
  repeatEndCondition?: RepeatEndCondition;
  notificationTime: number;
}
