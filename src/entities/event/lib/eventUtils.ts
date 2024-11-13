import { REPEAT_TYPE_LABELS } from '../config/constants';
import { Event, EventFormErrors, EventFormState, RepeatType } from '../model/types';

export const findOverlappingEvents = (existingEvents: Event[], newEvet: Event): Event[] => {
  return existingEvents.filter((event) => {
    if (event.date !== newEvet.date) return false;

    const newEventsStart = new Date(newEvet.startTime).getTime();
    const newEventsEnd = new Date(newEvet.endTime).getTime();
    const existingEventsStart = new Date(event.startTime).getTime();
    const existingEventsEnd = new Date(event.endTime).getTime();

    return (
      (newEventsStart >= existingEventsStart && newEventsStart <= existingEventsEnd) ||
      (newEventsEnd >= existingEventsStart && newEventsEnd <= existingEventsEnd) ||
      (newEventsStart <= existingEventsStart && newEventsEnd >= existingEventsEnd)
    );
  });
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
