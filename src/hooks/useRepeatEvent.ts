import { useEffect, useState } from 'react';

import { RepeatType } from '../types';

type RepeatEndType = 'never' | 'until' | 'count';

interface UseRepeatEventReturn {
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (type: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (interval: number) => void;
  repeatEndType: RepeatEndType;
  setRepeatEndType: (type: RepeatEndType) => void;
  repeatEndDate: string;
  setRepeatEndDate: (date: string) => void;
  repeatEndCount: number;
  setRepeatEndCount: (count: number) => void;
  eventDate: Date | null;
  setEventDate: (date: Date) => void;
  warning: string;
  intervalError: string;
  endDateError: string;
  endCountError: string;
}

const MAX_INTERVALS = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  yearly: 10,
};

const getIntervalErrorMessage = (type: RepeatType, interval: number): string => {
  if (interval < 1) {
    return '반복 간격은 1 이상이어야 합니다';
  }

  switch (type) {
    case 'daily':
      return interval > MAX_INTERVALS.daily ? '일간 반복은 최대 365일까지 가능합니다' : '';
    case 'weekly':
      return interval > MAX_INTERVALS.weekly ? '주간 반복은 최대 52주까지 가능합니다' : '';
    case 'monthly':
      return interval > MAX_INTERVALS.monthly ? '월간 반복은 최대 12개월까지 가능합니다' : '';
    case 'yearly':
      return interval > MAX_INTERVALS.yearly ? '연간 반복은 최대 10년까지 가능합니다' : '';
    default:
      return '';
  }
};

const useRepeatEvent = (): UseRepeatEventReturn => {
  // 기존 상태
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatInterval, setRepeatInterval] = useState<number>(1);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [warning, setWarning] = useState<string>('');
  const [intervalError, setIntervalError] = useState<string>('');

  // 새로운 반복 종료 관련 상태
  const [repeatEndType, setRepeatEndType] = useState<RepeatEndType>('never');
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');
  const [repeatEndCount, setRepeatEndCount] = useState<number>(0);
  const [endDateError, setEndDateError] = useState<string>('');
  const [endCountError, setEndCountError] = useState<string>('');

  // 기존 useEffect: 월간 반복 경고
  useEffect(() => {
    if (!eventDate || repeatType !== 'monthly') {
      setWarning('');
      return;
    }

    const day = eventDate.getDate();
    const month = eventDate.getMonth();
    const year = eventDate.getFullYear();

    if (month === 1 && day === 29 && isLeapYear(year)) {
      setWarning('윤년의 2월 29일은 매월 마지막 날로 처리됩니다');
      return;
    }

    if (day === 31) {
      setWarning('31일은 해당 월의 마지막 날로 처리됩니다');
      return;
    }
  }, [eventDate, repeatType]);

  // 기존 useEffect: 반복 간격 유효성 검사
  useEffect(() => {
    const error = getIntervalErrorMessage(repeatType, repeatInterval);
    setIntervalError(error);

    if (error && error.includes('1 이상')) {
      setRepeatInterval(1);
    }
  }, [repeatType, repeatInterval]);

  // 새로운 useEffect: 종료일 유효성 검사
  useEffect(() => {
    if (repeatEndType === 'until' && eventDate && repeatEndDate) {
      if (new Date(repeatEndDate) < eventDate) {
        setEndDateError('종료일은 시작일 이후여야 합니다');
        return;
      }
    }
    setEndDateError('');
  }, [repeatEndDate, eventDate, repeatEndType]);

  const handleSetRepeatType = (type: RepeatType) => {
    setRepeatType(type);
    setRepeatInterval(1);
  };

  const handleSetRepeatInterval = (interval: number) => {
    setRepeatInterval(interval);
  };

  const handleSetRepeatEndCount = (count: number) => {
    if (count < 1) {
      setEndCountError('반복 횟수는 1회 이상이어야 합니다');
      setRepeatEndCount(1);
      return;
    }
    setEndCountError('');
    setRepeatEndCount(count);
  };

  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  return {
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType: handleSetRepeatType,
    repeatInterval,
    setRepeatInterval: handleSetRepeatInterval,
    repeatEndType,
    setRepeatEndType,
    repeatEndDate,
    setRepeatEndDate,
    repeatEndCount,
    setRepeatEndCount: handleSetRepeatEndCount,
    eventDate,
    setEventDate,
    warning,
    intervalError,
    endDateError,
    endCountError,
  };
};

export default useRepeatEvent;
