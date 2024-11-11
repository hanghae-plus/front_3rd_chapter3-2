import { Event, RepeatType } from '@entities/event/model/types';
import { getTimeErrorMessage } from '@features/event/model/utils';
import { ChangeEvent } from 'react';
import { create } from 'zustand';

interface TimeErrorRecord {
  startTimeError: string | null;
  endTimeError: string | null;
}

interface EventFormState {
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
  editingEvent: Event | null;
  timeErrors: TimeErrorRecord;
  startTimeError: string | null;
  endTimeError: string | null;

  setTitle: (title: string) => void;
  setDate: (date: string) => void;
  setStartTime: (startTime: string) => void;
  setEndTime: (endTime: string) => void;
  setDescription: (description: string) => void;
  setLocation: (location: string) => void;
  setCategory: (category: string) => void;
  setIsRepeating: (isRepeating: boolean) => void;
  setRepeatType: (repeatType: RepeatType) => void;
  setRepeatInterval: (repeatInterval: number) => void;
  setRepeatEndDate: (repeatEndDate: string) => void;
  setNotificationTime: (notificationTime: number) => void;
  setEditingEvent: (event: Event | null) => void;
  setTimeErrors: (errors: TimeErrorRecord) => void;

  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  editEvent: (event: Event) => void;
}

export const useEventFormStore = create<EventFormState>((set) => ({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  isRepeating: false,
  repeatType: 'none',
  repeatInterval: 1,
  repeatEndDate: '',
  notificationTime: 10,
  editingEvent: null,
  startTimeError: null,
  endTimeError: null,
  timeErrors: {
    startTimeError: null,
    endTimeError: null,
  },

  setTitle: (title) => set({ title }),
  setDate: (date) => set({ date }),
  setStartTime: (startTime) => set({ startTime }),
  setEndTime: (endTime) => set({ endTime }),
  setDescription: (description) => set({ description }),
  setLocation: (location) => set({ location }),
  setCategory: (category) => set({ category }),
  setIsRepeating: (isRepeating) => set({ isRepeating }),
  setRepeatType: (repeatType) => set({ repeatType }),
  setRepeatInterval: (repeatInterval) => set({ repeatInterval }),
  setRepeatEndDate: (repeatEndDate) => set({ repeatEndDate }),
  setNotificationTime: (notificationTime) => set({ notificationTime }),
  setEditingEvent: (editingEvent) => set({ editingEvent }),
  setTimeErrors: (timeErrors) => set({ timeErrors }),

  handleStartTimeChange: (e) =>
    set((state) => {
      const newStartTime = e.target.value;
      const timeErrors = getTimeErrorMessage(newStartTime, state.endTime);
      return {
        startTime: newStartTime,
        timeErrors,
      };
    }),

  handleEndTimeChange: (e) =>
    set((state) => {
      const newEndTime = e.target.value;
      const timeErrors = getTimeErrorMessage(state.startTime, newEndTime);
      return {
        endTime: newEndTime,
        timeErrors,
      };
    }),

  resetForm: () =>
    set({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
      editingEvent: null,
      timeErrors: {
        startTimeError: null,
        endTimeError: null,
      },
    }),

  editEvent: (event) =>
    set({
      editingEvent: event,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      location: event.location,
      category: event.category,
      isRepeating: event.repeat.type !== 'none',
      repeatType: event.repeat.type,
      repeatInterval: event.repeat.interval,
      repeatEndDate: event.repeat.endDate || '',
      notificationTime: event.notificationTime,
    }),
}));
