import { Event, EventForm, RepeatType } from '@/types';

export type RepeatState = {
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
};

export type EventFormData = {
  formState: Omit<EventForm, 'startTime' | 'endTime' | 'repeat'>;
  repeatState: RepeatState;
  startTime: string;
  endTime: string;
  editingEvent?: Event | null;
};
