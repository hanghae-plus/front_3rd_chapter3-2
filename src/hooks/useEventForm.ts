import { ChangeEvent, useState } from 'react';

import { EventForm, RepeatInfo } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

const initialEventValue: EventForm = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: {
    type: 'none',
    interval: 1,
    endDate: '',
  },
  notificationTime: 10,
};

export const useEventForm = (initialEvent?: EventForm) => {
  const [eventForm, setEventForm] = useState<EventForm>(initialEvent || initialEventValue);

  const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');
  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const eventFormChange = <T, K extends keyof T>(prev: T, key: K, value: T[K]) => {
    return { ...prev, [key]: value };
  };

  const handleChangeFormContent = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setEventForm((prev) => eventFormChange(prev, key, value));
  };

  const handleChangeFormRepeat = <K extends keyof RepeatInfo>(key: K, value: RepeatInfo[K]) => {
    setEventForm((prev) => ({ ...prev, repeat: eventFormChange(prev.repeat, key, value) }));
  };

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    handleChangeFormContent('startTime', newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, eventForm.endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;

    handleChangeFormContent('endTime', newEndTime);
    setTimeError(getTimeErrorMessage(eventForm.startTime, newEndTime));
  };

  const resetForm = () => {
    setEventForm(initialEventValue);
    setIsRepeating(false);
  };

  return {
    eventForm,
    setEventForm,
    handleChangeFormContent,
    handleChangeFormRepeat,
    isRepeating,
    setIsRepeating,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  };
};
