import { ChangeEvent, useEffect, useState } from 'react';

import { Event, RepeatType } from '../types';
import { isLeapYear, getLastDayOfMonth } from '../utils/dateUtils';
import { getTimeErrorMessage } from '../utils/timeValidation';

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

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const [dateWarning, setDateWarning] = useState('');
  const [validationError, setValidationError] = useState('');

  // 다음 반복 일정 날짜 계산
  const getNextDate = (fromDate: string): string => {
    if (!repeatType || repeatType === 'none') {
      return fromDate;
    }

    // getNextDate의 입력값 대신 현재 설정된 date 사용
    const baseDate = new Date(date);
    const targetDate = new Date(fromDate);

    // 윤년 체크를 위한 특수 케이스
    if (
      repeatType === 'yearly' &&
      baseDate.getMonth() === 1 && // 2월
      baseDate.getDate() === 29
    ) {
      // 29일

      const targetYear = targetDate.getFullYear();
      if (!isLeapYear(targetYear)) {
        // 목표 연도가 윤년이 아니면 2월 28일로 반환
        return `${targetYear}-02-28`;
      }
    }

    // 나머지 반복 유형 처리
    const nextDate = new Date(fromDate);
    switch (repeatType) {
      case 'daily': {
        nextDate.setDate(nextDate.getDate() + repeatInterval);
        break;
      }
      case 'weekly': {
        nextDate.setDate(nextDate.getDate() + 7 * repeatInterval);
        break;
      }
      case 'monthly': {
        nextDate.setMonth(nextDate.getMonth() + repeatInterval);
        const originalDay = baseDate.getDate();
        const lastDayOfNextMonth = getLastDayOfMonth(nextDate.getFullYear(), nextDate.getMonth());
        nextDate.setDate(Math.min(originalDay, lastDayOfNextMonth));
        break;
      }
      case 'yearly': {
        // 윤년 케이스는 위에서 처리됨
        break;
      }
      default:
        return fromDate;
    }

    return nextDate.toISOString().split('T')[0];
  };
  useEffect(() => {
    if (date && repeatType === 'monthly') {
      const selectedDate = new Date(date);
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth();

      if (month === 1 && day === 29) {
        setDateWarning('윤년의 2월 29일은 다음 달에는 28일로 설정됩니다.');
      } else if (day === 31) {
        setDateWarning('31일은 각 월의 마지막 날에 설정됩니다.');
      } else {
        setDateWarning('');
      }
    } else if (date && repeatType === 'yearly') {
      const selectedDate = new Date(date);
      if (selectedDate.getMonth() === 1 && selectedDate.getDate() === 29) {
        setDateWarning('윤년의 2월 29일은 비윤년에서 28일로 설정됩니다.');
      } else {
        setDateWarning('');
      }
    } else {
      setDateWarning('');
    }
  }, [date, repeatType]);

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

  // 반복 간격 설정 핸들러
  const handleSetRepeatInterval = (value: number) => {
    if (value < 1) {
      setValidationError('반복 간격은 1 이상이어야 합니다.');
      return;
    }
    setValidationError('');
    setRepeatInterval(value);
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

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  };

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
    setRepeatInterval: handleSetRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    dateWarning,
    getNextDate,
    validationError,
  };
};
