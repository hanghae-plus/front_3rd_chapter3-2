import {
  NotificationTime,
  RepeatEndCondition,
  RepeatType,
} from '../../../entities/event/model/types';

export interface TimeErrorRecord {
  startTimeError: string | null;
  endTimeError: string | null;
}

export interface EventFormState {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  repeatEndCondition?: RepeatEndCondition;
  repeatCount?: number;
  repeatDate?: string[];
  notificationTime: NotificationTime;
}

export interface FormErrors {
  startTime: string | null;
  endTime: string | null;
}
