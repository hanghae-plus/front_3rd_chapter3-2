import { ChangeEvent, useEffect, useState } from 'react';

import { Event, EventForm } from '../../../types';
import { getTimeErrorMessage } from '../../../utils/timeValidation';
import { INITIAL_EVENT_FORM } from '../@constant';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [eventForm, setEventForm] = useState<EventForm>(INITIAL_EVENT_FORM);

  const { startTime, endTime } = eventForm;

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setEventForm((prev) => ({ ...prev, startTime: newStartTime }));
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEventForm((prev) => ({ ...prev, endTime: newEndTime }));
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetForm = () => {
    setEventForm(INITIAL_EVENT_FORM);
  };

  useEffect(() => {
    if (initialEvent) {
      setEventForm(initialEvent);
    }
  }, [initialEvent]);

  return {
    eventForm,
    setEventForm,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  };
};
