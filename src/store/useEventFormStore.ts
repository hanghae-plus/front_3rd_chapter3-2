import { create } from 'zustand';

import { DEFAULT_REPEAT_INFO, Event, EventForm, RepeatInfo } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

type StoreEventForm = EventForm & {
  isRepeating: boolean;
};

type PartialEventForm = Omit<Partial<StoreEventForm>, 'repeat'> & {
  repeat?: Partial<RepeatInfo>;
};

interface EventFormState {
  eventForm: StoreEventForm;
  setEventForm: (eventForm: PartialEventForm) => void;
  resetForm: () => void;

  editingEvent: Event | null;
  resetEditingEvent: () => void;
  setEditingEvent: (event: Event) => void;

  timeErrorRecord: TimeErrorRecord;
  changeStartTime: (startTime: string) => void;
  changeEndTime: (endTime: string) => void;
}

const initialEventForm: StoreEventForm = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',

  isRepeating: false,
  repeat: DEFAULT_REPEAT_INFO,
  notificationTime: 10,
};

export const useEventFormStore = create<EventFormState>()((set) => ({
  eventForm: initialEventForm,
  setEventForm: (form) =>
    set((state) => ({
      eventForm: {
        ...state.eventForm,
        ...form,
        repeat: { ...state.eventForm.repeat, ...form.repeat },
      },
    })),
  resetForm: () => set(() => ({ eventForm: initialEventForm })),

  editingEvent: null,
  resetEditingEvent: () => set(() => ({ editingEvent: null })),
  setEditingEvent: (event) =>
    set(() => ({
      editingEvent: event,
      eventForm: {
        ...event,
        isRepeating: event.repeat.type !== 'none',
        repeat: {
          ...event.repeat,
          endDate: event.repeat.endDate || '',
        },
      },
    })),

  timeErrorRecord: {
    startTimeError: null,
    endTimeError: null,
  },
  changeStartTime: (startTime) =>
    set((state) => ({
      eventForm: { ...state.eventForm, startTime },
      timeErrorRecord: getTimeErrorMessage(startTime, state.eventForm.endTime),
    })),
  changeEndTime: (endTime) =>
    set((state) => ({
      eventForm: { ...state.eventForm, endTime },
      timeErrorRecord: getTimeErrorMessage(state.eventForm.startTime, endTime),
    })),
}));
