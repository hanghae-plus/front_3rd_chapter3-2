import { RepeatType } from '../../../entities/event/model/types';

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
  notificationTime: number;
  repeatCondition?: string;
}

export interface FormErrors {
  startTime: string | null;
  endTime: string | null;
}
