import { useEffect, useState } from 'react';
import { RepeatType } from '../types';

interface UseRepeatEventReturn {
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (type: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (interval: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (date: string) => void;
  eventDate: Date | null;
  setEventDate: (date: Date) => void;
  warning: string;
  intervalError: string;
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
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatInterval, setRepeatInterval] = useState<number>(1);
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [warning, setWarning] = useState<string>('');
  const [intervalError, setIntervalError] = useState<string>('');

  // 기존 날짜 관련 useEffect
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

  // 반복 간격 유효성 검사를 위한 useEffect
  useEffect(() => {
    const error = getIntervalErrorMessage(repeatType, repeatInterval);
    setIntervalError(error);

    if (error && error.includes('1 이상')) {
      setRepeatInterval(1);
    }
  }, [repeatType, repeatInterval]);

  const handleSetRepeatType = (type: RepeatType) => {
    setRepeatType(type);
    setRepeatInterval(1); // 반복 유형 변경 시 간격 초기화
  };

  const handleSetRepeatInterval = (interval: number) => {
    setRepeatInterval(interval);
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
    repeatEndDate,
    setRepeatEndDate,
    eventDate,
    setEventDate,
    warning,
    intervalError,
  };
};

export default useRepeatEvent;
