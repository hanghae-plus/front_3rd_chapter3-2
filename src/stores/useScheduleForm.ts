import { create } from 'zustand';

import { Event, EventForm, RepeatInfo, RepeatType } from '../types';

export interface NewScheduleForm extends Omit<EventForm, 'repeat'> {
  isEditing: boolean;
  isRecurring: boolean;
  setIsRecurring: (v: boolean) => void;
  id: string;

  setTitle: (v: string) => void;

  setDate: (v: string) => void;

  startTimeError: string;
  setStartTimeError: (v: string) => void;

  setStartTime: (v: string) => void;

  endTimeError: string;
  setEndTimeError: (v: string) => void;

  setEndTime: (v: string) => void;

  setDescription: (v: string) => void;

  setLocation: (v: string) => void;

  setCategory: (v: string) => void;

  isRepeating: boolean;
  setIsRepeating: (v: boolean) => void;

  repeat: RepeatInfo;
  setRepeat: (newValue: { [key: string]: string | number }) => void;

  setNotificationTime: (v: number) => void; // 분 단위로 저장

  exceptionList: string[];
  setExceptionList: (list: string[]) => void;

  setForm: (form: Event) => void;

  resetForm: () => void;
}

const useScheduleForm = create<NewScheduleForm>((set) => ({
  isEditing: false,
  isRecurring: false,
  setIsRecurring: (v: boolean) => set(() => ({ isRecurring: v })),
  id: '',

  title: '',
  setTitle: (title: string) => set(() => ({ title })),

  date: '',
  setDate: (date: string) => set(() => ({ date })),

  startTimeError: '',
  setStartTimeError: (message: string) => set(() => ({ startTimeError: message })),

  startTime: '',
  setStartTime: (startTime: string) => set(() => ({ startTime })),

  endTimeError: '',
  setEndTimeError: (message: string) => set(() => ({ endTimeError: message })),

  endTime: '',
  setEndTime: (endTime: string) => set(() => ({ endTime })),

  description: '',
  setDescription: (description: string) => set(() => ({ description })),

  location: '',
  setLocation: (location: string) => set(() => ({ location })),

  category: '',
  setCategory: (category: string) => set(() => ({ category })),

  isRepeating: true,
  setIsRepeating: (isRepeating: boolean) =>
    set(() => {
      return {
        isRepeating,
        repeat: { type: 'none', interval: 1, endDate: '' },
      };
    }),

  repeat: { type: 'none' as RepeatType, interval: 1, endDate: '' },
  setRepeat: (newValue: { [key: string]: string | number }) =>
    set((state) => ({ repeat: { ...state.repeat, ...newValue } })),

  notificationTime: 10,
  setNotificationTime: (notificationTime: number) => set(() => ({ notificationTime })),

  exceptionList: [],
  setExceptionList: (list: string[]) =>
    set((state) => {
      const exception = new Set([...state.exceptionList, ...list]);
      return { exceptionList: Array.from(exception) };
    }),

  setForm: (form: Event) =>
    set(() => ({
      isEditing: true,
      id: form.id,
      title: form.title,
      date: form.date,
      startTimeError: '',
      startTime: form.startTime,
      endTime: form.endTime,
      endTimeError: '',
      description: form.description,
      location: form.location,
      category: form.category,
      isRepeating: form.repeat.type !== 'none',
      repeat: form.repeat,
      notificationTime: form.notificationTime,
    })),

  resetForm: () =>
    set(() => ({
      isEditing: false,
      isRecurring: false,
      id: '',
      title: '',
      date: '',
      startTimeError: '',
      startTime: '',
      endTime: '',
      endTimeError: '',
      description: '',
      location: '',
      category: '',
      isRepeating: false,
      repeat: { type: 'none' as RepeatType, interval: 0, endDate: '' },
      notificationTime: 10,
    })),
}));

export default useScheduleForm;
