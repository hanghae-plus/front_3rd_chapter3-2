import { Event, EventForm } from '@/types';

export const validateRequiredEventData = (event: Event | EventForm) => {
  const { title, date, startTime, endTime } = event;
  if (!title || !date || !startTime || !endTime) {
    return false;
  }
  return true;
};

export const validateTime = (
  startTime: string,
  endTime: string,
  startTimeError: string | null,
  endTimeError: string | null
) => {
  if (startTime >= endTime || startTimeError || endTimeError) {
    return false;
  }
  return true;
};

type ValidateError = {
  event: Event | EventForm;
  error: { startTimeError: string | null; endTimeError: string | null };
};

export const validateEvent = ({ event, error }: ValidateError) => {
  const isRequiredPass = validateRequiredEventData(event);
  const isTimePass = validateTime(
    event.startTime,
    event.endTime,
    error.startTimeError,
    error.endTimeError
  );

  return {
    required: isRequiredPass,
    time: isTimePass,
  };
};
