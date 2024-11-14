import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import { createEventRepeatState } from '@/features/event/lib/eventUtils';
import { getTimeErrorMessage } from '@/features/event/lib/timeValidation';
import { Event, EventForm } from '@/types';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event | EventForm) => {
  const initialState = useMemo(() => {
    return {
      title: initialEvent?.title || '',
      date: initialEvent?.date || '',
      description: initialEvent?.description || '',
      location: initialEvent?.location || '',
      category: initialEvent?.category || '',
      notificationTime: initialEvent?.notificationTime || 10,
    };
  }, [initialEvent]);

  const initialRepeatState = useMemo(() => {
    return {
      isRepeating: initialEvent?.repeat.type !== 'none',
      repeatType: initialEvent?.repeat.type || 'none',
      repeatInterval: initialEvent?.repeat.interval || 1,
      repeatEndDate: initialEvent?.repeat.endDate || '',
    };
  }, [initialEvent]);

  const [formState, setFormState] = useState(() => initialState);
  const [repeatState, setRepeatState] = useState(() => initialRepeatState);

  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleRepeatChange = useCallback((name: string, value: string | boolean | number) => {
    setRepeatState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEventChange = useCallback((name: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStartTimeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newStartTime = e.target.value;
      setStartTime(newStartTime);
      setTimeError(getTimeErrorMessage(newStartTime, endTime));
    },
    [endTime]
  );

  const handleEndTimeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newEndTime = e.target.value;
      setEndTime(newEndTime);
      setTimeError(getTimeErrorMessage(startTime, newEndTime));
    },
    [startTime]
  );

  const resetForm = useCallback(() => {
    setStartTime('');
    setEndTime('');
    setFormState(initialState);
    setRepeatState({
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
    });
    setTimeError({ startTimeError: null, endTimeError: null });
  }, [initialState]);

  const editEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setFormState(event);
    setRepeatState(createEventRepeatState(event.repeat));
    setTimeError(getTimeErrorMessage(event.startTime, event.endTime));
  }, []);

  return {
    formState,
    repeatState,
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    handleEventChange,
    handleRepeatChange,
  };
};
