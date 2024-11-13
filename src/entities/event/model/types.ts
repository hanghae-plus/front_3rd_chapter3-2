export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

export type RepeatEndCondition = 'date' | 'count' | 'never';

export type NotificationTime = {
  value: number;
  label: string;
};

export interface EventRepeat {
  type: RepeatType;
  interval: number;
  endDate?: string;
  endCondition: RepeatEndCondition;
  count?: number;
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
  isRepeating: boolean;
  repeat: EventRepeat;
  repeatDate?: string[];
  notificationTime: NotificationTime;
}

export interface EventFormState extends Omit<Event, 'id' | 'repeat'> {
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  repeatEndCondition: RepeatEndCondition;
  repeatCount?: number;
}

export interface EventFormErrors {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  repeatInterval?: string;
  repeatEndDate?: string;
  repeatCount?: string;
  timeRange?: string;
  repeatDateRange?: string;
}
export interface EventFormStateToEvent {
  (formState: EventFormState): Omit<Event, 'id'>;
}

export interface EventToFormState {
  (event: Event): EventFormState;
}
