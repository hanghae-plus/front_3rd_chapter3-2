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
}

const useRepeatEvent = (): UseRepeatEventReturn => {
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatInterval, setRepeatInterval] = useState<number>(1);
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [warning, setWarning] = useState<string>('');

  useEffect(() => {
    if (!eventDate || repeatType !== 'monthly') {
      setWarning('');
      return;
    }

    const day = eventDate.getDate();
    const month = eventDate.getMonth();
    const year = eventDate.getFullYear();

    // 윤년 2월 29일 체크
    if (month === 1 && day === 29 && isLeapYear(year)) {
      setWarning('윤년의 2월 29일은 매월 마지막 날로 처리됩니다');
      return;
    }

    // 31일 체크
    if (day === 31) {
      setWarning('31일은 해당 월의 마지막 날로 처리됩니다');
      return;
    }
  }, [eventDate, repeatType]);

  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  return {
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    eventDate,
    setEventDate,
    warning,
  };
};

export default useRepeatEvent;
