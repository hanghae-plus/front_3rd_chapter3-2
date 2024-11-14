import { REPEAT_TYPE_LABELS } from '../config/constants';
import { Event, EventFormErrors, EventFormState, RepeatType } from '../model/types';

export const findOverlappingEvents = (existingEvents: Event[], newEvent: Event): Event[] => {
  if (!existingEvents?.length || !newEvent) return [];

  return existingEvents
    .filter((event) => {
      if (event.id === newEvent.id) return false;
      if (event.date !== newEvent.date) return false;
      try {
        const standardizeTime = (timeStr: string) => {
          if (!timeStr.includes(':')) {
            const hour = timeStr.slice(0, 2);
            const minute = timeStr.slice(2);
            return `${hour}:${minute}`;
          }
          return timeStr;
        };

        const newEventStartTime = `${newEvent.date}T${standardizeTime(newEvent.startTime)}`;
        const newEventEndTime = `${newEvent.date}T${standardizeTime(newEvent.endTime)}`;
        const existingEventStartTime = `${event.date}T${standardizeTime(event.startTime)}`;
        const existingEventEndTime = `${event.date}T${standardizeTime(event.endTime)}`;

        const newStart = new Date(newEventStartTime).getTime();
        const newEnd = new Date(newEventEndTime).getTime();
        const existingStart = new Date(existingEventStartTime).getTime();
        const existingEnd = new Date(existingEventEndTime).getTime();

        const isOverlapping =
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd);

        return isOverlapping;
      } catch (error) {
        console.error('Error comparing event times:', error);
        return false;
      }
    })
    .filter(Boolean);
};

export const getDate = (date: string) => {
  const eventDate = new Date(date);
  const day = eventDate.getDate();
  const month = eventDate.getMonth();
  return { day, month, eventDate };
};

export const findLastDateOfMonth = (date: string) => {
  const { month, eventDate } = getDate(date);
  return new Date(eventDate.getFullYear(), month + 1, 0).getDate();
};

export const handleRepeatDateLogic = (date: string, repeatType: RepeatType) => {
  if (!date || !repeatType) return;
  const { day, month } = getDate(date);

  const lastDayOfMonth = findLastDateOfMonth(date);
  const isLastDayOfMonth = day === lastDayOfMonth;
  const isFebruaryLeapDay = day === 29 && month === 1;
  return { lastDayOfMonth, isLastDayOfMonth, isFebruaryLeapDay };
};

export const getRepeatTypeLabel = (repeatType: RepeatType): string => {
  return REPEAT_TYPE_LABELS[repeatType] || '';
};

export const validateRepeatSettings = (formState: EventFormState): EventFormErrors => {
  const errors: EventFormErrors = {};

  if (formState.repeatEndCondition === 'date' && !formState.repeatEndDate) {
    errors.repeatEndDate = '종료 날짜를 선택해주세요';
  }

  if (formState.repeatEndCondition === 'count' && !formState.repeatCount) {
    errors.repeatCount = '반복 횟수를 입력해주세요';
  }

  return errors;
};
