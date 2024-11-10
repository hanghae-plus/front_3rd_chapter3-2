import { ChangeEvent, useEffect, useState } from 'react';

import { Event, RepeatType } from '../../../types';
import { getTimeErrorMessage } from '../../../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '');
  const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');
  const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
  const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('');
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setNotificationTime(10);
  };

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime);
      setDescription(initialEvent.description);
      setLocation(initialEvent.location);
      setCategory(initialEvent.category);
      setIsRepeating(initialEvent.repeat.type !== 'none');
      setRepeatType(initialEvent.repeat.type);
      setRepeatInterval(initialEvent.repeat.interval);
      setRepeatEndDate(initialEvent.repeat.endDate || '');
      setNotificationTime(initialEvent.notificationTime);
    }
  }, [initialEvent]);

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  };
};
